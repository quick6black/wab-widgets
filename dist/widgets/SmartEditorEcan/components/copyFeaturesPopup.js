define(["dojo/_base/declare", "jimu/BaseWidgetSetting", "dijit/_WidgetsInTemplateMixin", "dojo/_base/lang", 'dojo/_base/array', "dojo/text!./templates/copyFeaturesPopup.html", "jimu/dijit/Popup", "dojo/dom-construct", 'dojo/dom-style', 'esri/dijit/editing/TemplatePicker'], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, lang, array, CopyFeaturesTemplate, Popup, domConstruct, domStyle, TemplatePicker) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'copy-features',
    templateString: CopyFeaturesTemplate,
    popup: null,
    layers: [],
    startup: function startup() {
      this.inherited(arguments);

      this.templatePicker = new TemplatePicker({
        featureLayers: this.layers,
        rows: "auto",
        columns: 6,
        grouping: true,
        /*style: "height: auto; overflow: auto;",*/
        'class': 'esriTemplatePicker',
        maxLabelLength: "25",
        showTooltip: false

      }, this.divTemplatePicker);

      this.templatePicker.startup();

      this.templatePicker.on("selection-change", lang.hitch(this, function () {
        var selected = this.templatePicker.getSelected();
        if (selected) {
          var featureLayer = selected.featureLayer;
          var type = selected.type;
          var template = selected.template;
          this.popup.enableButton(0);
        } else {
          this.popup.disableButton(0);
        }
      }));
    },
    postCreate: function postCreate() {
      //create popup for bufferSettings
      this._createCopyFeaturesPopup();

      this._initMultipleFeaturesContent();
    },

    _initMultipleFeaturesContent: function _initMultipleFeaturesContent() {
      if (this.featureSet && this.featureSet.features.length > 1) {
        domStyle.set(this.multipleFeaturesContent, 'display', 'block');
      }
    },

    /**
    * create popup to display layer chooser
    * @memberOf widgets/SmartEditorEcan/components/copyFeaturesPopup
    **/
    _createCopyFeaturesPopup: function _createCopyFeaturesPopup() {
      //creating ok button
      this.okButton = domConstruct.create("button", {
        title: this.nls.copyFeaturesPopup.ok
      });
      this.okButton.label = this.nls.copyFeaturesPopup.ok;
      this.okButton.onClick = lang.hitch(this, function () {
        this.onOkClick();
      });
      //creating cancel button
      this.cancelButton = domConstruct.create("button", {
        title: this.nls.copyFeaturesPopup.cancel
      });
      this.cancelButton.label = this.nls.copyFeaturesPopup.cancel;
      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.copyFeaturesPopup.titleLabel,
        content: this.copyFeaturesContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.okButton, this.cancelButton]
      });
      //Setting default state of ok button as disabled
      this.popup.disableButton(0);
    },

    getSelectedTemplate: function getSelectedTemplate() {
      if (this.templatePicker) {
        return this.templatePicker.getSelected();
      } else return null;
    },

    onOkClick: function onOkClick(evt) {
      return evt;
    },

    destroy: function destroy() {
      this.inherited(arguments);

      if (this.templatePicker) {
        this.templatePicker.destroy();
        this.templatePicker = null;
      }
    }
  });
});
