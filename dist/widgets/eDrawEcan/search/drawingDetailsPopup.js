define(["dojo/_base/declare", "jimu/BaseWidgetSetting", "dijit/_WidgetsInTemplateMixin", 'dijit/form/TextBox', 'dijit/form/ValidationTextBox', "dojo/_base/lang", 'dojo/_base/array', "dojo/text!./templates/drawingDetailsPopup.html", "jimu/dijit/Popup", "dojo/dom-construct", 'dojo/dom-style', 'dojo/date/locale', './util'], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, TextBox, ValidationTextBox, lang, array, DrawingDetailsTemplate, Popup, domConstruct, domStyle, locale, util) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'edraw-drawing-details',
    templateString: DrawingDetailsTemplate,
    popup: null,
    dateLastModified: null,
    startup: function startup() {
      this.inherited(arguments);
      this.render();
    },
    postCreate: function postCreate() {
      //set up the input controls
      this._initSettingsForm();

      //create popup for drawing Details
      this._createDrawingDetailsPopup();
    },

    render: function render() {},

    _initSettingsForm: function _initSettingsForm() {
      //set  options
      this.drawingNameInput.set('value', this.drawing.title);
      this.drawingSnippetInput.value = this.drawing.snippet;

      if (this.user.username !== this.drawing.owner) {
        this.updateButton.set('disabled', true);
      }
    },

    /**
    * create popup to display layer chooser
    * @memberOf widgets/eDrawEcan/drawingDetailsPopup
    **/
    _createDrawingDetailsPopup: function _createDrawingDetailsPopup() {
      //creating ok button
      this.updateButton = domConstruct.create("button", {
        title: this.nls.drawingDetails.updateLabel
      });
      this.updateButton.label = this.nls.drawingDetails.updateLabel;
      this.updateButton.onClick = lang.hitch(this, this._saveSettings);
      //creating back button
      this.backButton = domConstruct.create("button", {
        title: this.nls.drawingDetails.backLabel
      });
      this.backButton.label = this.nls.drawingDetails.backLabel;
      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.drawingDetails.dialogTitle,
        content: this.drawingDetailsContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.updateButton, this.backButton]
      });

      this._renderTypeOwnerDate();
      //Setting default state of ok button as disabled
      //this.popup.disableButton(0);
    },

    _saveSettings: function _saveSettings(evt) {
      // build settings option
      this.onUpdateClick();
    },

    _formatDate: function _formatDate(date) {
      if (typeof date === "number") {
        date = new Date(date);
      }
      var fmt = this.nls.drawingDetails.dateFormat;
      return locale.format(date, {
        selector: "date",
        datePattern: fmt
      });
    },

    _renderTypeOwnerDate: function _renderTypeOwnerDate() {
      var s,
          item = this.drawing;

      var sType = this.nls.drawingDetails.drawingType;

      var ownerPattern = this.nls.drawingDetails.ownerPattern;
      s = ownerPattern.replace("{owner}", item.owner);
      util.setNodeText(this.ownerNode, s);

      var sDate = this._formatDate(item.modified);
      s = this.nls.drawingDetails.datePattern.replace("{date}", sDate);
      util.setNodeText(this.dateNode, s);
    },

    onUpdateClick: function onUpdateClick(evt) {
      return evt;
    },

    getSettings: function getSettings() {
      return {
        itemId: this.drawing.id,
        title: this.drawingNameInput.get('value'),
        snippet: this.drawingSnippetInput.value
      };
    }

  });
});
