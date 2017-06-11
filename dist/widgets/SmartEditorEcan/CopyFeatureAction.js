define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/_base/lang', 'jimu/BaseFeatureAction', 'jimu/WidgetManager', 'esri/tasks/query', 'esri/tasks/QueryTask'], function (declare, array, lang, BaseFeatureAction, WidgetManager, Query, QueryTask) {
  var clazz = declare(BaseFeatureAction, {

    iconFormat: 'png',

    isFeatureSupported: function isFeatureSupported(featureSet) {
      if (featureSet.features.length > 0) {
        // Get geometry type and ensure editable layer of this geometry type is available
        var geometryType = featureSet.geometryType;
        if (!geometryType) {
          geometryType = featureSet.features[0].geometry.geometryType;
        }
        geometryType = this._getEsriGeometryType(geometryType);

        var layerIds = this.map.graphicsLayerIds,
            hasEditableLayer = false;
        array.forEach(layerIds, lang.hitch(this, function (layerId) {
          var layer = this.map.getLayer(layerId);
          if (layer.capabilities && layer.capabilities.indexOf('Create') >= 0) {
            // Check geometry type
            if (layer.geometryType && layer.geometryType === geometryType) {
              hasEditableLayer = true;
            }
          }
        }));
        return hasEditableLayer;
      }

      return false;
    },

    onExecute: function onExecute(featureSet) {
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId).then(lang.hitch(this, function (myWidget) {
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

      return layer.queryFeatures(query);
    },

    _getEsriGeometryType: function _getEsriGeometryType(geometryType) {
      var esriGeometryType = '';
      switch (geometryType) {
        case 'polygon':
          esriGeometryType = 'esriGeometryPolygon';
          break;

        case 'polyline':
          esriGeometryType = 'esriGeometryPolyline';
          break;

        case 'point':
          esriGeometryType = 'esriGeometryPoint';
          break;

        default:
          esriGeometryType = geometryType;
          break;
      }
      return esriGeometryType;
    }

  });
  return clazz;
});
