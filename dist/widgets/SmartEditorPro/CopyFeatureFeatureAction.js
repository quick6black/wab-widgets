define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/Deferred', 'jimu/BaseFeatureAction', 'jimu/Role', 'jimu/WidgetManager', 'dojo/query', 'jimu/PopupManager', 'dojo/aspect', './utils', 'esri/tasks/query', 'esri/tasks/QueryTask', "esri/InfoTemplate"], function (declare, array, lang, Deferred, BaseFeatureAction, Role, WidgetManager, query, PopupManager, aspect, utils, esriQuery, esriQueryTask, InfoTemplate) {
  var clazz = declare(BaseFeatureAction, {

    _viewedFeatureIdArr: [], // to store the feature of a layer and table that is being viewed in info-window
    _widgetInstance: null, // to store widget instance
    _config: null, // to store widget config
    _layerFoundDetail: {}, // to store the details of layer that are traversed/viewed by user in info-window
    _isInfoWindowBackBtnClickHandle: false, // to raise a flag that states that back button of info
    _viewedFeatureDetailedArr: [],
    _viewedFeatureArr: [], // to store the feature as traversed in info-window

    map: null,
    iconFormat: 'png',

    /**
     * This function detects whether info-window is opened, closed or in closing state
     */
    _isInfoWindowShowing: function _isInfoWindowShowing() {
      // here map object gets available with the help of BaseFeatureAction class
      if (this.map.infoWindow.isShowing) {
        // after switching from one feature to another, this function gets executed when info-window is still closing
        // hence, we need to handle following cases
        // info-window is open -> shows loading text : consider as close
        var statusContainer = query(".statusSection", this.map.infoWindow.domNode);
        if (statusContainer && statusContainer.length > 0) {
          // info-window is open -> shows loading text -> related records is displayed : consider as open
          if (this._isRelatedRecordDisplayed()) {
            return true;
          }
          // info-window is open -> shows loading text : consider as close
          return false;
        }
        // info-window is open -> related records is displayed : consider as open
        if (this._isRelatedRecordDisplayed()) {
          return true;
        }
        return true;
      } else {
        // if info-window is closed
        return false;
      }
      // default
      return false;
    },

    /**
     * This function is used to get the configuration of a widget
     */
    _getWidgetConfig: function _getWidgetConfig() {
      if (!this._widgetInstance) {
        this._widgetInstance = this.appConfig.getConfigElementById(this.widgetId);
      }
      if (!this._config && this._widgetInstance) {
        // once widget is found get its config
        this._config = this._widgetInstance.config;
      }
      if (this._config) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * This function detects whether to display copy feature option in info-window or not
     */
    isFeatureSupported: function isFeatureSupported(featureSet, layerParam) {
      //check if copy feature enabled
      if (this._getWidgetConfig() && this._config.editor.createNewFeaturesFromExisting !== true) {
        return false;
      }

      //detects if editable layerscof specific geometry type are available 
      if (!this._checkEditGeometry(featureSet, layerParam)) {
        return false;
      }
      return true;
    },

    /**
     * This function gets executed when user clicks on smart editor option in info-window
     */
    onExecute: function onExecute(featureSet, layerParam) {
      //jshint unused:false
      var layer = layerParam || lang.getObject('_wabProperties.popupInfo.layerForActionWithEmptyFeatures', false, this.map.infoWindow);
      var def = new Deferred();
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId).then(lang.hitch(this, function (smartEditor) {

        if (this._checkForFeatureLayers(featureSet)) {
          // Query the source layer to get the ungeneralised version of the feature
          this._queryForFeatures(featureSet).then(lang.hitch(this, function (results) {
            this._applyLayerDetails(results, layer);
            setTimeout(lang.hitch(this, function () {
              smartEditor.copyFeaturesAction(results);
            }), 500);
          }), function (error) {
            alert(error);
          });
        } else {
          this._applyLayerDetails(featureSet, layer);
          setTimeout(lang.hitch(this, function () {
            smartEditor.copyFeaturesAction(featureSet);
          }), 500);
        }
      }));
      return def.promise;
    },

    _checkEditGeometry: function _checkEditGeometry(featureSet, layerParam) {
      if (featureSet && featureSet.features.length > 0) {
        // Get geometry type and ensure editable layer of this geometry type is available
        var geometryType = featureSet.geometryType;
        if (!geometryType) {
          geometryType = featureSet.features[0].geometry.geometryType;
        }
        geometryType = utils.getArcGISGeometryType(geometryType);

        var layerIds = this.map.graphicsLayerIds,
            showLayer = false;
        array.forEach(layerIds, lang.hitch(this, function (layerId) {
          var layer = this.map.getLayer(layerId);
          if (layer.capabilities && layer.capabilities.indexOf('Create') >= 0 && layer.url !== null) {
            // Check geometry type
            if (layer.geometryType && layer.geometryType === geometryType) {
              showLayer = true;
            }
          }
        }));
        return showLayer;
      }

      return false;
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

      var query = new esriQuery();
      query.maxAllowableOffset = 0;
      query.objectIds = objectIds;
      query.outFields = fields;
      query.returnGeometry = true;

      // Create query task and execute against it - used instead of feature layer to override auto generalisation.  Note also checks for dynamic layers and alters url if found.
      var serviceUrl = layer.url.indexOf('dynamicLayer') < 0 ? layer.url : layer.url.substring(0, layer.url.lastIndexOf("Server/") + 7) + layer.source.mapLayerId;
      var queryTask = new esriQueryTask(serviceUrl);
      return queryTask.execute(query);
    },

    _applyLayerDetails: function _applyLayerDetails(featureSet, layer) {
      var infoTemplate = new InfoTemplate(layer.infoTemplate.toJson());
      array.forEach(featureSet.features, lang.hitch(this, function (feature) {
        feature._layer = layer;
        feature.setInfoTemplate(infoTemplate);
      }));
    }

  });
  return clazz;
});
