define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',

  'jimu/BaseFeatureAction',
  'jimu/WidgetManager',

  'esri/tasks/query',
  'esri/tasks/QueryTask'
], function (
  declare, 
  arrayUtils,
  lang,

  BaseFeatureAction, 
  WidgetManager,

  Query,
  QueryTask
){
  var clazz = declare(BaseFeatureAction, {
    iconFormat: 'png',

    _widgetConfig: null,
    _recordTemplate: null,

    isFeatureSupported: function (featureSet) {
      this._recordTemplate = null;
      if (featureSet.features.length === 1 && 
          	featureSet.features[0].geometry.type === 'polygon' &&
          	this._checkForFeatureLayers(featureSet)) {
  			var cfg = this._getThisConfig();

        //check if edit is enabled
        if (!cfg.allowEditExisting) {
          return false;
        }

  			var layer = featureSet.features[0].getLayer();

  			var isLayer = false;

        //handle use of dynamic layers
        var serviceUrl = layer.url.substring(0,layer.url.lastIndexOf("Server/") + 6);

        //itereate to find a template asscoated with this type of record
  			arrayUtils.forEach(cfg.recordTemplates, lang.hitch(this, 
  				function (recordTemplate) {
  					if (layer.url === recordTemplate.lookupUrl) {
  						isLayer = true;
              this._recordTemplate = recordTemplate;
  					} else if (recordTemplate.lookupUrl.indexOf(serviceUrl) >= 0) {
              //check if features include the entity fields
              if (typeof featureSet.features[0].attributes[recordTemplate.lookupKeyField] !== 'undefined') {
                isLayer = true;
                this._recordTemplate = recordTemplate;
              }
            }
  				})
  			);
  			return isLayer;
  		} else {
  			return false;
  		}    	
    },

    onExecute: function (featureSet) {
      var wm = WidgetManager.getInstance();
      wm.triggerWidgetOpen(this.widgetId)
        .then(lang.hitch(this, function (myWidget) {
          wm.activateWidget(myWidget);
            myWidget.editRecord(
              this._recordTemplate.apiSettings.mappingClass, 
              featureSet.features[0].attributes[this._recordTemplate.lookupKeyField]
            );
          })
        );
    },

    _checkForFeatureLayers: function (featureSet) {
      if (featureSet && featureSet.features && featureSet.features.length > 0) {
        var layer = featureSet.features[0].getLayer();
        if (layer.capabilities && layer.capabilities.indexOf("Query") >= 0 && layer.url !== null) {
          return true;
        }       
      }

      return false;
    },

    _getThisConfig: function () {
    	if (this._widgetConfig === null) {
    		var widgetsLst = this.appConfig.widgetPool.widgets;
    		var cfg = null;
    		arrayUtils.forEach(widgetsLst, lang.hitch(this, 
    			function(item) {
    				if (item.id === this.widgetId) {
					cfg = item.config;   				
    				}
    			})
    		);

    		if (cfg !== null) {
    			this._widgetConfig = cfg;
    		}
    	}

    	return this._widgetConfig;
    }
  });
  return clazz;
});
