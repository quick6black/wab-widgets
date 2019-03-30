define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'jimu/BaseFeatureAction',
  'jimu/WidgetManager',
  'esri/tasks/query',
  'esri/tasks/QueryTask'  
], function(declare, lang, BaseFeatureAction, WidgetManager, Query, QueryTask){
  var clazz = declare(BaseFeatureAction, {

    iconFormat: 'png',

    isFeatureSupported: function(featureSet){
      return featureSet.features.length > 0;

      if (featureSet.features.length === 0) {
        //bug check - is the popup showing and does it have a current record showing  
        var pop = this.map.infoWindow;
        if (pop.isShowing || pop.features.length > 0) {
          var graphic = pop.getSelectedFeature(); 

          if (!graphic) {
            graphic = pop.features[0];
          }

          return true       
        }

        return false;
      }
      else {
        return featureSet.features.length > 0;
      }
    },

    onExecute: function(featureSet){
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId)
      .then(lang.hitch(this, function(myWidget) {
        if (this._checkForFeatureLayers(featureSet)) {
            // Query the source layer to get the ungeneralised version of the feature
            this._queryForFeatures(featureSet)
              .then(
                function(results) {
                  myWidget.convertToDrawing(results);
                }, 
                function (error) {
                  alert(error);
                }
              );
        } else {
          myWidget.convertToDrawing(featureSet);
        }
      }));
    },

    _checkForFeatureLayers: function (featureSet) {
      var layer = featureSet.features[0].getLayer();
      if (layer.capabilities && layer.capabilities.indexOf("Query") >= 0 && layer.url !== null) {
        return true;
      }

      return false;
    },

    _queryForFeatures: function (featureSet) {
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

      // Create query task and execute against it - used instead of feature layer to override auto generalisation.  Note also checks for dynamic layers and alters rul if found.
      var serviceUrl = layer.url.indexOf('dynamicLayer') < 0 ? layer.url : layer.url.substring(0,layer.url.lastIndexOf("Server/") + 7) + layer.source.mapLayerId;
      var queryTask = new QueryTask(serviceUrl);      
      return queryTask.execute(query);
    }

  });
  return clazz;
});