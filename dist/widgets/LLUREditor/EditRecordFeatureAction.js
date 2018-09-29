define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/_base/lang', 'jimu/BaseFeatureAction', 'jimu/WidgetManager', 'esri/tasks/query', 'esri/tasks/QueryTask'], function (declare, arrayUtils, lang, BaseFeatureAction, WidgetManager, Query, QueryTask) {
  var clazz = declare(BaseFeatureAction, {
    iconFormat: 'png',

    _widgetConfig: null,

    isFeatureSupported: function isFeatureSupported(featureSet) {
      if (featureSet.features.length = 1 && featureSet.features[0].geometry.type === 'polygon' && this._checkForFeatureLayers(featureSet)) {
        var cfg = this._getThisConfig();
        var layer = featureSet.features[0].getLayer();

        var isLayer = false;
        arrayUtils.forEach(cfg.recordTemplates, lang.hitch(this, function (recordTemplate) {
          if (layer.url === recordTemplate.lookupUrl) {
            isLayer = true;
          }
        }));

        return isLayer;
      } else {
        return false;
      }
    },

    onExecute: function onExecute(featureSet) {
      var wm = WidgetManager.getInstance();
      wm.triggerWidgetOpen(this.widgetId).then(lang.hitch(this, function (myWidget) {
        wm.activateWidget(myWidget);
        if (this._checkForFeatureLayers(featureSet)) {
          // Query the source layer to get the ungeneralised version of the feature
          this._queryForFeatures(featureSet).then(function (results) {
            myWidget.editRecord(results);
          }, function (error) {
            alert(error);
          });
        } else {
          myWidget.editRecord(featureSet);
        }
      }));
    },

    _checkForFeatureLayers: function _checkForFeatureLayers(featureSet) {
      var layer = featureSet.features[0].getLayer();
      if (layer.capabilities && layer.capabilities.indexOf("Query") >= 0 && layer.url !== null) {
        return true;
      }

      return false;
    },

    _queryForFeatures: function _queryForFeatures(featureSet) {
      var layer = featureSet.features[0].getLayer();
      var objectIdField = layer.objectIdField;
      var objectIds = featureSet.features.map(function (feature) {
        return feature.attributes[objectIdField];
      });

      var fields = featureSet.fields ? featureSet.fields.map(lang.hitch(this, function (field) {
        return field.name;
      })) : ['*'];

      var query = new Query();
      query.maxAllowableOffset = 0;
      query.objectIds = objectIds;
      query.outFields = fields;
      query.returnGeometry = true;

      var queryTask = new QueryTask(layer.url);
      return queryTask.execute(query);
    },

    _getThisConfig: function _getThisConfig() {
      if (this._widgetConfig === null) {
        var widgetsLst = this.appConfig.widgetPool.widgets;
        var cfg = null;
        arrayUtils.forEach(widgetsLst, lang.hitch(this, function (item) {
          if (item.id === this.widgetId) {
            cfg = item.config;
          }
        }));

        if (cfg !== null) {
          this._widgetConfig = cfg;
        }
      }

      return this._widgetConfig;
    }

  });
  return clazz;
});
