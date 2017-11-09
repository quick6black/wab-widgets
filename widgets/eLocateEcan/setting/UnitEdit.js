/*global define*/
define(
  ['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/dom-style',
  'dojo/on',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'jimu/BaseWidgetSetting',
  'dojo/text!./UnitEdit.html',
  'dijit/form/TextBox',
  'dijit/form/RadioButton',
  'jimu/SpatialReference/utils',
  'dijit/registry'
  ],
  function(
    declare,
    lang,
    domStyle,
    on,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    BaseWidgetSetting,
    template,
    TextBox,
    RadioButton,
    utils,
    registry) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
      baseClass: 'unit-edit',
      templateString: template,
      config:null,
      tr:null,
      popup: null,
      adding: false,
      currentWkid: null,
      defaultMapRefPrecision: 4,

      postCreate: function() {
        this.inherited(arguments);
      },

      startup: function() {
        this.inherited(arguments);
        if(!this.config){
          this.popup.disableButton(0);
        }
        this._setConfig(this.config);
      },

      getConfig: function(){
        // Create array of examples from input
        var examples = this.unitExampleTB.get('value').split(';');
        for (var i = 0; i < examples.length; i++) {
            examples[i] = examples[i].replace(/ +(?= )/g, ''); // Remove white space
        }

        var config = {
          wkid: utils.standardizeWkid(this.wkid.get('value')),
          mapref: this.unitMapRefTB.get('value') === 'on',
          maprefprecision: (this.unitMapRefTB.get('value') !== 'on' ? null : parseInt(this.unitMapRefPrecisionDD.get('value'))),
          name: this.unitnameTB.get('value'),
          examples: examples,
          xlabel: this.unitXLabelTB.get('value'),
          ylabel: this.unitYLabelTB.get('value')
        };
        this.config = config;
        return [this.config, this.tr];
      },

      _setConfig: function(config) {
        this._config = lang.clone(config);

        utils.loadResource().then(lang.hitch(this, function() {
          if (config && config.wkid) {
            this.wkid.set('value', parseInt(config.wkid, 10));
            this.unitMapRefTB.set('value', this.config.mapref);
            this.unitMapRefPrecisionDD.set('value', this.config.maprefprecision);
            this.currentWkid = parseInt(config.wkid, 10);
            this.unitnameTB.set('value', lang.trim(this.config.name));
            this.unitExampleTB.set('value', lang.trim(this.config.examples.join('; ')));
            this.unitXLabelTB.set('value', lang.trim(this.config.xlabel));
            this.unitYLabelTB.set('value', lang.trim(this.config.ylabel));
          }
        }), lang.hitch(this, function(err) {
          console.error(err);
        }));
      },

      onWkidChange: function(newValue) {
        var label = "",
          newWkid = parseInt(newValue, 10);

        this.popup.disableButton(0);

        if (utils.isValidWkid(newWkid)) {
          label = utils.getSRLabel(newWkid);
          this.wkidLabel.innerHTML = label;
          if(this.unitnameTB.get('value') === ""){
            this.unitnameTB.set('value', label.split("_").join(" "));
          }
          if(this.unitXLabelTB.get('value') === ""){
            if(utils.isGeographicCS(newWkid)){
              this.unitXLabelTB.set('value', this.nls.geox);
            }else{
              this.unitXLabelTB.set('value', this.nls.projx);
            }
          }
          if(this.unitYLabelTB.get('value') === ""){
            if(utils.isGeographicCS(newWkid)){
              this.unitYLabelTB.set('value', this.nls.geoy);
            }else{
              this.unitYLabelTB.set('value', this.nls.projy);
            }
          }
          this.popup.enableButton(0);
          if (newWkid === 2193 || newWkid === 27200) {
              domStyle.set(this.wkidMapRef, 'display', '');
              domStyle.set(this.wkidMapRefPrecision, 'display', (this.unitMapRefTB.get('value') === 'on' ? '' : 'none'));
          } else {
              this.unitMapRefTB.set('value', false);
              this.unitMapRefPrecisionDD.set('value', null);
              domStyle.set(this.wkidMapRef, 'display', 'none');
              domStyle.set(this.wkidMapRefPrecision, 'display', 'none');
          }
        } else if (newValue) {
          this.wkid.set('value', "");
          this.wkidLabel.innerHTML = this.nls.cName;
          this.unitMapRefTB.set('value', false);
          this.unitMapRefPrecisionDD.set('value', null);
          domStyle.set(this.wkidMapRef, 'display', 'none');
          domStyle.set(this.wkidMapRefPrecision, 'display', 'none');
        }
        this.currentWkid = newWkid;
      },

      onMapRefChange: function(newValue) {
          domStyle.set(this.wkidMapRefPrecision, 'display', (newValue ? '' : 'none'));
          if (newValue && this.unitMapRefPrecisionDD.get('value') == null) {
              this.unitMapRefPrecisionDD.set('value', this.defaultMapRefPrecision);
          }
      }
    });
  });
