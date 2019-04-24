define([
  'dojo/_base/declare',
  'dojo/_base/array',
  'dojo/_base/lang',
  'dojo/Deferred',
  'jimu/BaseFeatureAction',
  'jimu/Role',
  'jimu/WidgetManager',
  'dojo/query',
  'jimu/PopupManager',
  'dojo/aspect',
  './utils'
], function (
  declare,
  array,
  lang,
  Deferred,
  BaseFeatureAction,
  Role,
  WidgetManager,
  query,
  PopupManager,
  aspect,
  utils
) {
  var clazz = declare(BaseFeatureAction, {

    _viewedFeatureIdArr: [], // to store the feature of a layer and table that is being viewed in info-window
    _widgetInstance: null, // to store widget instance
    _config: null, // to store widget config
    _layerFoundDetail: {}, // to store the details of layer that are traversed/viewed by user in info-window
    _isInfoWindowBackBtnClickHandle: false, // to raise a flag that states that back button of info
    _viewedFeatureDetailedArr: [],
    _viewedFeatureArr: [], // to store the feature as traversed in info-window

    map: null,
    iconClass: 'icon-edit',

    /**
     * This function detects whether info-window is opened, closed or in closing state
     */
    _isInfoWindowShowing: function () {
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
    _getWidgetConfig: function () {
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
     * This function detects whether to display smartEditor option in info-window or not
     */
    isFeatureSupported: function (featureSet, layerParam) {
      //detects if editable layerscof specific geometry type are available 
      if (!this._checkEditGeometry(featureSet, layerParam)) {
        return false;
      }
      return true;
    },

    /**
     * This function gets executed when user clicks on smart editor option in info-window
     */
    onExecute: function (featureSet, layerParam) {
      //jshint unused:false
      var layer = layerParam ||
        lang.getObject('_wabProperties.popupInfo.layerForActionWithEmptyFeatures', false, this.map.infoWindow);
      var def = new Deferred();
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId).then(lang.hitch(this, function (smartEditor) {
        
        alert("Start Copy");

        /*
        if (this._checkForFeatureLayers(featureSet)) {
            // Query the source layer to get the ungeneralised version of the feature
            this._queryForFeatures(featureSet)
              .then(
                function(results) {
                  smartEditor.copyFeatureSet(results);
                }, 
                function (error) {
                  alert(error);
                }
              );
        } else {
          smartEditor.copyFeatureSet(featureSet);
        }       
        */

        //smartEditor.beginEditingByFeatures(
        //  featureSet.features, layer, this._viewedFeatureIdArr, this._viewedFeatureArr);
      }));
      return def.promise;
    },

    _checkEditGeometry: function (featureSet, layerParam) {
      if (featureSet && featureSet.features.length > 0) {
        // Get geometry type and ensure editable layer of this geometry type is available
        var geometryType = featureSet.geometryType;
        if (!geometryType) {
          geometryType = featureSet.features[0].geometry.geometryType;
        }
        geometryType = utils.getArcGISGeometryType(geometryType);

        var layerIds = this.map.graphicsLayerIds, showLayer = false;
        array.forEach(layerIds, lang.hitch(this, function(layerId) {
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

      return layer.queryFeatures(query);
    }

  });
  return clazz;
});