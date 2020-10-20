define(["dojo/_base/declare", "jimu/BaseWidgetSetting", "dijit/_WidgetsInTemplateMixin", "dijit/form/DropDownButton", "dijit/DropDownMenu", "dijit/MenuItem", "dojo/_base/lang", 'dojo/_base/array', "dojo/text!./templates/RequestStatementPopup.html", "jimu/dijit/Popup", "dojo/dom-construct", 'dojo/dom-style'], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, DropDownButton, DropDownMenu, MenuItem, lang, arrayUtils, RequestStatementTemplate, Popup, domConstruct, domStyle) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'request-llur-statement',
    templateString: RequestStatementTemplate,
    popup: null,

    wabWidget: null,
    selectedRadius: null,

    startup: function startup() {
      this.inherited(arguments);

      if (this.wabWidget && this.wabWidget.recordTemplateLayers) {
        //get the enquiry template
        var recordTemplate = this.wabWidget._getRecordTemplate('ENQ');

        var radiusField = arrayUtils.filter(recordTemplate.layer.fields, function (field) {
          return field.name === 'SearchRadius';
        })[0];

        var values = radiusField.domain.codedValues;
        var defValue = arrayUtils.filter(values, function (value) {
          return (value.code === 0) || (value.code === "0");
        })[0];

        //create a new dropdown for the search radius types
        this.searchRadiusOptions = new DropDownButton({
          label: ""
        }, this.searchRadiusDropdownDiv);
        this.searchRadiusOptions.startup();

        this.searchRadiusOptionsMenu = new DropDownMenu();

        arrayUtils.forEach(values, function (option) {
          var menuParams = {
            label: option.name,
            value: option.code
          };
          lang.mixin(menuParams, {
            onClick: lang.hitch(this, function () {
              this._optionsClick(menuParams);
            })
          });

          var menuItem = new MenuItem(menuParams);
          this.searchRadiusOptionsMenu.addChild(menuItem);
        }, this);

        this.searchRadiusOptionsMenu.startup();
        this.searchRadiusOptions.set('dropDown', this.searchRadiusOptionsMenu);

        this.currentRadius = null;
        this.searchRadiusOptions.set('label', defValue.name);
      }
    },

    postCreate: function postCreate() {
      this._requestLLURStatementPopup();
    },

    /**
    * create popup to display layer chooser
    * @memberOf widgets/LLUREditor/components/requestStatementPopup
    **/
    _requestLLURStatementPopup: function _requestLLURStatementPopup() {
      //creating ok button
      this.okButton = domConstruct.create("button", {
        title: this.nls.requestLLURStatementPopup.ok
      });
      this.okButton.label = this.nls.requestLLURStatementPopup.ok;
      this.okButton.onClick = lang.hitch(this, function () {
        this.onOkClick();
      });

      //creating cancel button
      this.cancelButton = domConstruct.create("button", {
        title: this.nls.requestLLURStatementPopup.cancel
      });
      this.cancelButton.label = this.nls.requestLLURStatementPopup.cancel;

      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.requestLLURStatementPopup.titleLabel,
        content: this.requestLLURStatementContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.okButton, this.cancelButton]
      });

      //Setting default state of ok button as disabled
      this.popup.disableButton(0);
    },

    getSelectedSearchRadius: function getSelectedSearchRadius() {
      return this.selectedRadius.value;
    },

    _optionsClick: function _optionsClick(radiusOption) {
      this.selectedRadius = radiusOption;
      this.searchRadiusOptions.set('label', radiusOption.label);
      this.popup.enableButton(0);
    },

    onOkClick: function onOkClick(evt) {
      return evt;
    },

    destroy: function destroy() {
      this.inherited(arguments);

      if (this.searchRadiusOptions) {
        this.searchRadiusOptions.destroy();
        this.searchRadiusOptions = null;
      }

      if (this.searchRadiusOptionsMenu) {
        this.searchRadiusOptionsMenu.destroy();
        this.searchRadiusOptionsMenu = null;
      }
    }
  });
});
