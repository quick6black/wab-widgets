define(["dojo/_base/declare", "jimu/BaseWidgetSetting", "dijit/_WidgetsInTemplateMixin", "dojo/_base/lang", 'dojo/_base/array', "dojo/text!./templates/mergeFeaturesPopup.html", "jimu/dijit/Popup", "dojo/dom-construct", 'dojo/dom-style'], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, lang, array, MergeFeaturesTemplate, Popup, domConstruct, domStyle) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'merge-features',
    templateString: MergeFeaturesTemplate,
    popup: null,
    layers: [],
    startup: function startup() {
      this.inherited(arguments);
    },
    postCreate: function postCreate() {
      //create popup for bufferSettings
      this._createMergeFeaturesPopup();
    },

    /**
    * create popup to display feature summary
    * @memberOf widgets/SmartEditorEcan/components/mergeFeaturesPopup
    **/
    _createMergeFeaturesPopup: function _createMergeFeaturesPopup() {
      //creating ok button
      this.okButton = domConstruct.create("button", {
        title: this.nls.mergeFeaturesPopup.ok
      });
      this.okButton.label = this.nls.mergeFeaturesPopup.ok;
      this.okButton.onClick = lang.hitch(this, function () {
        this.onOkClick();
      });
      //creating cancel button
      this.cancelButton = domConstruct.create("button", {
        title: this.nls.mergeFeaturesPopup.cancel
      });
      this.cancelButton.label = this.nls.mergeFeaturesPopup.cancel;
      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.mergeFeaturesPopup.titleLabel,
        content: this.mergeFeaturesContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.okButton, this.cancelButton]
      });
      //Setting default state of ok button as disabled
      //this.popup.disableButton(0);
    },

    onOkClick: function onOkClick(evt) {
      return evt;
    },

    destroy: function destroy() {
      this.inherited(arguments);
    }
  });
});
