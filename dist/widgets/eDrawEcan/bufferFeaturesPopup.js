define(["dojo/_base/declare", "jimu/BaseWidgetSetting", "dijit/_WidgetsInTemplateMixin", "dojo/_base/lang", 'dojo/_base/array', "dojo/text!./bufferFeaturesPopup.html", "jimu/dijit/Popup", "dojo/dom-construct", 'dojo/dom-style', 'esri/units'], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, lang, array, BufferFeaturesTemplate, Popup, domConstruct, domStyle, esriUnits) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'edraw-buffer',
    templateString: BufferFeaturesTemplate,
    popup: null,
    showCustomDistance: false,
    defaultDistanceUnits: null,
    configDistanceUnits: [],
    bufferSettings: {},
    startup: function startup() {
      this.inherited(arguments);
    },
    postCreate: function postCreate() {
      //set up the input controls
      this._initSettingsForm();

      //create popup for bufferSettings
      this._createBufferSettingsPopup();
    },

    _initSettingsForm: function _initSettingsForm() {
      //set buffer options
      var defaultOption = null,
          bufferOptions = [];
      array.forEach(this.config.bufferOptions, lang.hitch(this, function (bufferInfo) {
        var option = {
          value: bufferInfo.label,
          label: bufferInfo.label
        };

        if (bufferInfo.default) {
          defaultOption = option;
        }
        bufferOptions.push(option);
      }));

      //custom distance option
      bufferOptions.push({
        value: "custom",
        label: this.nls.bufferCustomDistanceOptionLabel
      });
      this.bufferModeNodeSelect.addOption(bufferOptions);

      //set distance units
      this.defaultDistanceUnits = [{
        unit: 'KILOMETERS',
        label: this.nls.kilometers
      }, {
        unit: 'MILES',
        label: this.nls.miles
      }, {
        unit: 'METERS',
        label: this.nls.meters
      }, {
        unit: 'NAUTICAL_MILES',
        label: this.nls.nauticals
      }, {
        unit: 'FEET',
        label: this.nls.feet
      }, {
        unit: 'YARDS',
        label: this.nls.yards
      }];

      var bufferDistanceOptions = [];
      array.forEach(this.config.distanceUnits, lang.hitch(this, function (unitInfo) {
        var unit = unitInfo.unit;
        if (esriUnits[unit]) {
          var defaultUnitInfo = this._getDefaultDistanceUnitInfo(unit);
          unitInfo.label = defaultUnitInfo.label;
          this.configDistanceUnits.push(unitInfo);
        }

        var option = {
          value: unitInfo.unit,
          label: unitInfo.label
        };
        bufferDistanceOptions.push(option);
      }));
      this.bufferDistanceUnitsSelect.addOption(bufferDistanceOptions);

      // Set the default option
      if (defaultOption !== null) {
        this.bufferModeNodeSelect.set("value", defaultOption);

        // Find the associated distance unit for this option
        this.bufferDistanceUnitsSelect.set("value", this._getMeasurementOption(defaultOption.label));
      }
    },

    _getBufferConfigOption: function _getBufferConfigOption(bufferOptionLabel) {
      var option = null;
      array.forEach(this.config.bufferOptions, lang.hitch(this, function (bufferInfo) {
        if (bufferInfo.label === bufferOptionLabel) {
          option = bufferInfo;
        }
      }));
      return option;
    },

    _getMeasurementOption: function _getMeasurementOption(bufferOptionLabel) {
      var bufferOption = this._getBufferConfigOption(bufferOptionLabel);
      var unit = bufferOption !== null ? bufferOption.unit : "METERS";
      var result = null;
      array.forEach(this.bufferDistanceUnitsSelect.options, lang.hitch(this, function (distanceOption) {
        if (distanceOption.value === unit) {
          result = distanceOption;
        }
      }));
      return result;
    },

    /**
    * create popup to display layer chooser
    * @memberOf widgets/eDrawEcan/bufferFeaturesPopup
    **/
    _createBufferSettingsPopup: function _createBufferSettingsPopup() {
      //creating ok button
      this.okButton = domConstruct.create("button", {
        title: this.nls.ok
      });
      this.okButton.label = this.nls.ok;
      this.okButton.onClick = lang.hitch(this, this._getBufferSettings);
      //creating cancel button
      this.cancelButton = domConstruct.create("button", {
        title: this.nls.cancel
      });
      this.cancelButton.label = this.nls.cancel;
      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.bufferLabel,
        content: this.bufferSettingsContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.okButton, this.cancelButton]
      });
      //Setting default state of ok button as disabled
      //this.popup.disableButton(0);
    },

    /**
    * This function get selected layer and create map server URL
    * @memberOf widgets/eDrawEcan/bufferSettingsPopup
    **/
    _getBufferSettings: function _getBufferSettings() {
      var distance = this.bufferDistanceNode.value,
          distances = [];
      var rings = this.bufferRingNumberNode.value;
      for (var i = 1, il = rings; i <= il; i++) {
        distances.push(distance * i);
      }
      this.bufferSettings = {
        distance: distances,
        unit: this.bufferDistanceUnitsSelect.value,
        unionResults: this.bufferMergeNode.checked
      };
      this.onOkClick();
    },

    _getDefaultDistanceUnitInfo: function _getDefaultDistanceUnitInfo(unit) {
      for (var i = 0; i < this.defaultDistanceUnits.length; i++) {
        var unitInfo = this.defaultDistanceUnits[i];
        if (unitInfo.unit === unit) {
          return unitInfo;
        }
      }
      return null;
    },

    onBufferModeChange: function onBufferModeChange() {
      var mode = this.bufferModeNodeSelect.value;
      if (mode === "custom") {
        domStyle.set(this.bufferCustomDistanceSection, 'display', 'table-row');
        this.showCustomDistance = true;
      } else {
        if (this.showCustomDistance) {
          domStyle.set(this.bufferCustomDistanceSection, 'display', 'none');
          this.showCustomDistance = false;
        }
        this.bufferDistanceNode.set("value", this._getBufferConfigOption(mode).distance);

        // Find the associated distance unit for this option
        this.bufferDistanceUnitsSelect.set("value", this._getMeasurementOption(mode));
      }
    },

    onOkClick: function onOkClick(evt) {
      return evt;
    }
  });
});
