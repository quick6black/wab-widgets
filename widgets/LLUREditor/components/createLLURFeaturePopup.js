define([
  "dojo/_base/declare",
  "jimu/BaseWidgetSetting",
  "dijit/_WidgetsInTemplateMixin",
  "dijit/form/DropDownButton",
  "dijit/DropDownMenu",
  "dijit/MenuItem",

  "dojo/_base/lang",
  'dojo/_base/array',

  "dojo/text!./templates/CreateLLURFeaturePopup.html",

  "jimu/dijit/Popup",

  "dojo/dom-construct",
  'dojo/dom-style'
], function (
  declare,
  BaseWidgetSetting,
  _WidgetsInTemplateMixin,
  DropDownButton,
  DropDownMenu,
  MenuItem,

  lang,
  arrayUtils,
  
  CreateLLLURFeatureTemplate,
  
  Popup,

  domConstruct,
  domStyle
) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'create-llur-features',
    templateString: CreateLLLURFeatureTemplate,
    popup: null,

    wabWidget: null,
    selecteTemplate: null,

    startup: function () {
      this.inherited(arguments);

      if(this.wabWidget && this.wabWidget.recordTemplateLayers) {
        //create a new dropdown for the record types
        this.templates = new DropDownButton({
            label: ""
        }, this.templateDropdownDiv);
        this.templates.startup();

        this.templatesMenu = new DropDownMenu();
        arrayUtils.forEach(this.wabWidget.recordTemplateLayers,
          function (option) {
            var menuParams = {
              label: option.title,
              template: option
            };
            //lang.mixin(menuParams, 
             // {
             //   onClick: lang.hitch(this, this._optionsClick(menuParams))
             // }
            //); 
            lang.mixin(menuParams, 
              {
                onClick: lang.hitch(this, function () {
                  this._optionsClick(menuParams);
                })
              }
            );

            var menuItem = new MenuItem(menuParams);
            this.templatesMenu.addChild(menuItem);

          }, this);
          this.templatesMenu.startup();
          this.templates.set('dropDown', this.templatesMenu);   

          this.currentTemplate = null; 
          this.templates.set('label', "Choose Record Type");                 
      }

    },

    postCreate: function () {
      this._createCreateLLURFeaturePopup();
      this._initMultipleFeaturesContent();
    },

    _initMultipleFeaturesContent: function () {
      if (this.featureSet && this.featureSet.features.length > 1 ) {
      }
    },

    /**
    * create popup to display layer chooser
    * @memberOf widgets/LLUREditor/components/createCreateLLURFeaturePopup
    **/
    _createCreateLLURFeaturePopup: function () {
      //creating ok button
      this.okButton = domConstruct.create("button", {
        title: this.nls.createCreateLLURFeaturePopup.ok
      });
      this.okButton.label = this.nls.createCreateLLURFeaturePopup.ok;
      this.okButton.onClick = lang.hitch(this, function () { this.onOkClick();});

      //creating cancel button
      this.cancelButton = domConstruct.create("button", {
        title: this.nls.createCreateLLURFeaturePopup.cancel
      });
      this.cancelButton.label = this.nls.createCreateLLURFeaturePopup.cancel;

      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.createCreateLLURFeaturePopup.titleLabel,
        content: this.createLLURFeatureContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.okButton, this.cancelButton]
      });

      //Setting default state of ok button as disabled
      this.popup.disableButton(0);
    },

    getSelectedRecordType: function () {
      return this.selecteTemplate;
    },

    _optionsClick: function (templateOption) {
      this.selecteTemplate = templateOption.template; 
      this.templates.set('label', templateOption.label);   
      this.popup.enableButton(0);
    },

    onOkClick: function (evt) {
      return evt;
    },

    destroy: function () {
      this.inherited(arguments);

      if (this.templates) {
        this.templates.destroy();
        this.templates = null;
      }

      if (this.templatesMenu) {
        this.templatesMenu.destroy();
        this.templatesMenu = null;
      }
    }
  });
});