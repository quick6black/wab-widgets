define(['dojo/_base/declare', 'dojo/_base/lang', 'jimu/BaseFeatureAction', 'jimu/WidgetManager', 'esri/tasks/query', 'esri/tasks/QueryTask'], function (declare, lang, BaseFeatureAction, WidgetManager, Query, QueryTask) {
  var clazz = declare(BaseFeatureAction, {

    iconFormat: 'png',

    isFeatureSupported: function isFeatureSupported(featureSet) {
      return featureSet.features.length > 0;
    },

    onExecute: function onExecute(featureSet) {
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId).then(lang.hitch(this, function (myWidget) {
        if (this._checkForFeatureLayers(featureSet)) {
          // Query the source layer to get the ungeneralised version of the feature
          this._queryForFeatures(featureSet).then(function (results) {
            myWidget.convertToDrawing(results);
          }, function (error) {
            alert(error);
          });
        } else {
          myWidget.convertToDrawing(featureSet);
        }
      }));
    },

    _checkForFeatureLayers: function _checkForFeatureLayers(featureSet) {
      var layer = featureSet.features[0].getLayer();
      if (layer.capabilities && layer.capabilities.indexOf("Query") >= 0) {
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

      // Create query task and execute against it - used instead of feature layer to override auto generalisation
      var queryTask = new QueryTask(layer.url);
      return queryTask.execute(query);
    }

  });
  return clazz;
});
