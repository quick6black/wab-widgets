define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/_base/lang', 'jimu/BaseFeatureAction', 'jimu/WidgetManager', 'esri/tasks/query', 'esri/tasks/QueryTask'], function (declare, arrayUtils, lang, BaseFeatureAction, WidgetManager, Query, QueryTask) {
  var clazz = declare(BaseFeatureAction, {
    iconFormat: 'png',

    isFeatureSupported: function isFeatureSupported(featureSet) {
      return featureSet.features.length > 0 && featureSet.features[0].geometry.type === 'polygon';
    },

    onExecute: function onExecute(featureSet) {
      var wm = WidgetManager.getInstance();
      wm.triggerWidgetOpen(this.widgetId).then(lang.hitch(this, function (myWidget) {
        wm.activateWidget(myWidget);
        if (this._checkForFeatureLayers(featureSet)) {
          // Query the source layer to get the ungeneralised version of the feature
          this._queryForFeatures(featureSet).then(function (results) {
            myWidget.copyFeatureSet(results);
          }, function (error) {
            alert(error);
          });
        } else {
          myWidget.copyFeatureSet(featureSet);
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

      var objectIds = null;
      /* CHANGE 2018-12-20 : Check for multiple selected features */
      var selectedFeatures = layer.getSelectedFeatures();
      if (selectedFeatures && selectedFeatures.length > featureSet.features.length) {
        //use selected feature details
        objectIds = selectedFeatures.map(function (feature) {
          return feature.attributes[objectIdField];
        });
      } else {
        //use featureset details
        objectIds = featureSet.features.map(function (feature) {
          return feature.attributes[objectIdField];
        });
      }

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
    }

  });
  return clazz;
});
