///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/html', 'dojo/_base/array', 'dojo/on', 'dojo/promise/all', 'dijit/_WidgetsInTemplateMixin', 'esri/symbols/SimpleMarkerSymbol', 'esri/symbols/SimpleLineSymbol', 'esri/symbols/SimpleFillSymbol', 'esri/symbols/jsonUtils', 'esri/Color', 'jimu/BaseWidget', 'jimu/WidgetManager', 'jimu/dijit/ViewStack', 'jimu/dijit/FeatureSetChooserForMultipleLayers', 'jimu/LayerInfos/LayerInfos', 'jimu/SelectionManager', 'jimu/dijit/FeatureActionPopupMenu', './layerUtil', './SelectableLayerItem', './FeatureItem', 'esri/graphic', 'esri/geometry/geometryEngine', 'esri/geometry/Polygon', 'jimu/dijit/LoadingShelter'], function (declare, lang, html, array, on, all, _WidgetsInTemplateMixin, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, SymbolJsonUtils, Color, BaseWidget, WidgetManager, ViewStack, FeatureSetChooserForMultipleLayers, LayerInfos, SelectionManager, PopupMenu, layerUtil, SelectableLayerItem, FeatureItem, Graphic, geometryEngine, Polygon) {
  return declare([BaseWidget, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-select-ecan',

    postMixInProperties: function postMixInProperties() {
      this.inherited(arguments);
      lang.mixin(this.nls, window.jimuNls.common);
    },

    postCreate: function postCreate() {
      this.inherited(arguments);
      var selectionColor = new Color(this.config.selectionColor);
      this.defaultPointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 16, null, selectionColor);
      this.defaultLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, selectionColor, 2);
      this.defaultFillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, this.defaultLineSymbol, new Color([selectionColor.r, selectionColor.g, selectionColor.b, 0.3]));
      this.popupMenu = PopupMenu.getInstance();
      /**
       * Helper object to keep which layer is selectable.
       */
      this.layerMapper = {};
      this.layerObjectArray = [];
      this.layerItems = [];

      // create select dijit
      this.selectDijit = new FeatureSetChooserForMultipleLayers({
        map: this.map,
        updateSelection: true,
        fullyWithin: this.config.selectionMode === 'wholly',
        geoTypes: this.config.geometryTypes || ['EXTENT']
      });

      html.place(this.selectDijit.domNode, this.selectDijitNode);
      this.selectDijit.startup();

      this.own(on(this.selectDijit, 'user-clear', lang.hitch(this, this._clearAllSelections)));
      this.own(on(this.selectDijit, 'loading', lang.hitch(this, function () {
        this.shelter.show();
      })));
      this.own(on(this.selectDijit, 'unloading', lang.hitch(this, function () {
        this.shelter.hide();
      })));

      this.viewStack = new ViewStack({
        viewType: 'dom',
        views: [this.layerListNode, this.detailsNode]
      });
      html.place(this.viewStack.domNode, this.domNode);

      this.own(on(this.switchBackBtn, 'click', lang.hitch(this, this._switchToLayerList)));
      if (window.isRTL) {
        html.addClass(this.switchBackIcon, 'icon-arrow-forward');
      } else {
        html.addClass(this.switchBackIcon, 'icon-arrow-back');
      }

      this._switchToLayerList();

      var layerInfosObject = LayerInfos.getInstanceSync();

      layerUtil.getLayerInfoArray(layerInfosObject).then(lang.hitch(this, function (layerInfoArray) {
        //First loaded, reset selectableLayerIds
        this._initLayers(layerInfoArray);
      }));

      this.own(on(layerInfosObject, 'layerInfosChanged', lang.hitch(this, function () {
        this.shelter.show();

        layerUtil.getLayerInfoArray(layerInfosObject).then(lang.hitch(this, function (layerInfoArray) {
          this._initLayers(layerInfoArray);
        }));
      })));

      this.own(on(layerInfosObject, 'layerInfosIsShowInMapChanged', lang.hitch(this, this._layerVisibilityChanged)));

      this.own(on(this.map, 'zoom-end', lang.hitch(this, this._layerVisibilityChanged)));
      this.own(on(this.settingNode, 'click', lang.hitch(this, function (event) {
        event.stopPropagation();
        var position = html.position(event.target);
        this.showPopup(position);
      })));
    },

    showPopup: function showPopup(position) {
      var actions = [{
        iconClass: 'no-icon',
        label: this.nls.turnonAll,
        data: {},
        onExecute: lang.hitch(this, this._turnOnAllLayers)
      }, {
        iconClass: 'no-icon',
        label: this.nls.turnoffAll,
        data: {},
        onExecute: lang.hitch(this, this._turnOffAllLayers)
      }, {
        iconClass: 'no-icon',
        label: this.nls.toggleSelect,
        data: {},
        onExecute: lang.hitch(this, this._toggleAllLayers)
      }];
      this.popupMenu.setActions(actions);
      this.popupMenu.show(position);
    },

    onDeActive: function onDeActive() {
      if (this.selectDijit.isActive()) {
        this.selectDijit.deactivate();
      }
      this._restoreSelectionSymbol();
    },

    onActive: function onActive() {
      this._setSelectionSymbol();

      // ECAN CHANGE - Specifiy whether select dijit should be activuated when widget activates
      var setActive = this.config.selectOnActivate !== undefined ? this.config.selectOnActivate : true;

      if (setActive && !this.selectDijit.isActive()) {
        this.selectDijit.activate();
      }
    },

    onOpen: function onOpen() {
      WidgetManager.getInstance().activateWidget(this);
    },

    onDestroy: function onDestroy() {
      if (this.selectDijit.isActive()) {
        this.selectDijit.deactivate();
      }
      this._clearAllSelections();
    },

    _filterLayerInfo: function _filterLayerInfo(layerInfoArray) {
      if (!this.config.layerState) {
        return layerInfoArray;
      }
      var layerInfosObject = LayerInfos.getInstanceSync();
      var webmapLayerInfos = layerInfosObject.getLayerInfoArrayOfWebmap();
      return array.filter(layerInfoArray, lang.hitch(this, function (layerInfo) {
        var inWhiteList = this.config.layerState[layerInfo.id] && this.config.layerState[layerInfo.id].selected;
        if (inWhiteList) {
          return true;
        } else if (this.config.includeRuntimeLayers !== false) {
          return array.every(webmapLayerInfos, function (webmapLayerInfo) {
            return layerInfo.getRootLayerInfo().id !== webmapLayerInfo.id;
          });
        }
        return false;
      }));
    },

    _initLayers: function _initLayers(layerInfoArray) {
      this.layerObjectArray = [];
      this.layerItems = [];
      this.selectionSymbols = {};

      html.empty(this.layerItemsNode);
      this.shelter.show();

      all(this._obtainLayerObjects(layerInfoArray)).then(lang.hitch(this, function (layerObjects) {
        array.forEach(layerObjects, lang.hitch(this, function (layerObject, index) {
          // hide from the layer list if layerobject is undefined or there is no objectIdField
          if (layerObject && layerObject.objectIdField && layerObject.geometryType) {
            var layerInfo = layerInfoArray[index];
            var visible = layerInfo.isShowInMap() && layerInfo.isInScale();

            // ECAN CHANGE - Configure initial state of selected check box to override visible state

            var checked = visible;
            if (this.config.selectedLayersMode && this.config.selectedLayersMode !== 'visible') {
              checked = this.config.selectedLayersMode === 'none' ? false : true;
            }

            var item = new SelectableLayerItem({
              layerInfo: layerInfo,
              checked: checked, //visible, -- ECAN default to not-selected initially
              layerVisible: visible,
              folderUrl: this.folderUrl,
              allowExport: this.config ? this.config.allowExport : false,
              map: this.map,
              nls: this.nls
            });
            this.own(on(item, 'switchToDetails', lang.hitch(this, this._switchToDetails)));
            this.own(on(item, 'stateChange', lang.hitch(this, function () {
              this.shelter.show();
              this.selectDijit.setFeatureLayers(this._getSelectableLayers());
              this.shelter.hide();
            })));
            item.init(layerObject);
            html.place(item.domNode, this.layerItemsNode);
            item.startup();

            this.layerItems.push(item);
            this.layerObjectArray.push(layerObject);

            if (!layerObject.getSelectionSymbol()) {
              this._setDefaultSymbol(layerObject);
            }

            var symbol = layerObject.getSelectionSymbol();
            this.selectionSymbols[layerObject.id] = symbol.toJson();
          }
        }));
        this.selectDijit.setFeatureLayers(this._getSelectableLayers());
        this._setSelectionSymbol();
        this.shelter.hide();
      }));
    },

    _turnOffAllLayers: function _turnOffAllLayers() {
      this.shelter.show();
      array.forEach(this.layerItems, lang.hitch(this, function (layerItem) {
        layerItem.turnOff();
      }));
      this.selectDijit.setFeatureLayers([]);
      this.shelter.hide();
    },

    _turnOnAllLayers: function _turnOnAllLayers() {
      this.shelter.show();
      array.forEach(this.layerItems, lang.hitch(this, function (layerItem) {
        layerItem.turnOn();
      }));
      this.selectDijit.setFeatureLayers(this._getSelectableLayers());
      this.shelter.hide();
    },

    _toggleAllLayers: function _toggleAllLayers() {
      this.shelter.show();
      array.forEach(this.layerItems, lang.hitch(this, function (layerItem) {
        layerItem.toggleChecked();
      }));
      this.selectDijit.setFeatureLayers(this._getSelectableLayers());
      this.shelter.hide();
    },

    _setSelectionSymbol: function _setSelectionSymbol() {
      array.forEach(this.layerObjectArray, function (layerObject) {
        this._setDefaultSymbol(layerObject);
      }, this);
    },

    _setDefaultSymbol: function _setDefaultSymbol(layerObject) {
      if (layerObject.geometryType === 'esriGeometryPoint' || layerObject.geometryType === 'esriGeometryMultipoint') {
        layerObject.setSelectionSymbol(this.defaultPointSymbol);
      } else if (layerObject.geometryType === 'esriGeometryPolyline') {
        layerObject.setSelectionSymbol(this.defaultLineSymbol);
      } else if (layerObject.geometryType === 'esriGeometryPolygon') {
        layerObject.setSelectionSymbol(this.defaultFillSymbol);
      } else {
        console.warn('unknown geometryType: ' + layerObject.geometryType);
      }
    },

    _restoreSelectionSymbol: function _restoreSelectionSymbol() {
      array.forEach(this.layerObjectArray, function (layerObject) {
        var symbolJson = this.selectionSymbols[layerObject.id];
        if (symbolJson) {
          layerObject.setSelectionSymbol(SymbolJsonUtils.fromJson(symbolJson));
        }
      }, this);
    },

    _layerVisibilityChanged: function _layerVisibilityChanged() {
      array.forEach(this.layerItems, function (layerItem) {
        layerItem.updateLayerVisibility();
      }, this);
    },

    _getSelectableLayers: function _getSelectableLayers() {
      var layers = [];
      array.forEach(this.layerItems, function (layerItem) {
        if (layerItem.isLayerVisible() && layerItem.isChecked()) {
          layers.push(layerItem.featureLayer);
        }
      }, this);

      return layers;
    },

    _clearAllSelections: function _clearAllSelections() {
      var selectionMgr = SelectionManager.getInstance();
      array.forEach(this.layerObjectArray, function (layerObject) {
        selectionMgr.clearSelection(layerObject);
      });
    },

    _obtainLayerObjects: function _obtainLayerObjects(layerInfoArray) {
      return array.map(layerInfoArray, function (layerInfo) {
        return layerInfo.getLayerObject();
      });
    },

    _switchToDetails: function _switchToDetails(layerItem) {
      html.empty(this.featureContent);
      this.viewStack.switchView(1);
      this.selectedLayerName.innerHTML = layerItem.layerName;
      this.selectedLayerName.title = layerItem.layerName;

      layerItem.layerInfo.getLayerObject().then(lang.hitch(this, function (layerObject) {
        var selectedFeatures = layerObject.getSelectedFeatures();
        if (selectedFeatures.length > 0) {
          array.forEach(selectedFeatures, lang.hitch(this, function (feature) {
            var item = new FeatureItem({
              graphic: feature,
              map: this.map,
              featureLayer: layerObject,
              displayField: layerObject.displayField,
              objectIdField: layerObject.objectIdField,
              allowExport: this.config ? this.config.allowExport : false,
              nls: this.nls
            });
            html.place(item.domNode, this.featureContent);
            item.startup();
          }));
        }
      }));
    },

    _switchToLayerList: function _switchToLayerList() {
      this.viewStack.switchView(0);
    },

    ///////////////////////////// ECAN CHANGES /////////////////////////////

    /// Custome function added to handle a passed featureset to generate a shape to select features by
    selectByFeature: function selectByFeature(featureSet) {
      // Deactivate draw tool
      this.selectDijit.deactivate();

      // Perfrom selection based on number of records supplied
      switch (featureSet.features.length) {
        case 0:
          //do nothing
          return;
          break;

        case 1:
          // Send geometry to selectDigit's draw tool
          this._simulateDrawAction(featureSet.features[0]);
          break;

        default:
          // Merge geometry and send to selectDigit's draw tool
          var searchGeometry = null,
              mergeGeometries = [];
          if (featureSet.geometryType === 'point') {
            // Build equares around point of 1m - drawTool doesn't support multipoints
            for (var i = 0, il = featureSet.features.length; i < il; i++) {
              var geometry = featureSet.features[i].geometry;
              mergeGeometries.push(this._pointToPolygon(geometry));
            }
          } else {
            mergeGeometries.push(geometry);
          }
          searchGeometry = geometryEngine.union(mergeGeometries);
          this._simulateDrawAction(new Graphic(searchGeometry));
          break;
      }
    },

    _pointToPolygon: function _pointToPolygon(pt, offset) {
      offset = offset || 1;
      var xmin = pt.x - offset,
          ymin = pt.y - offset,
          xmax = pt.x + offset,
          ymax = pt.y + offset;
      return new Polygon({ "rings": [[[xmin, ymin], [xmin, ymax], [xmax, ymax], [xmax, ymin], [xmin, ymin]]],
        "spatialReference": { "wkid": pt.spatialReference.wkid }
      });
    },

    _simulateDrawAction: function _simulateDrawAction(graphic, geotype, commontype, shiftKey, ctrlKey, metaKey) {

      if (geotype === undefined) {
        switch (graphic.geometry.type) {
          case 'point':
            geotype = 'POINT';
            commontype = 'point';
            break;

          case 'polyline':
            geotype = 'POLYLINE';
            commontype = 'polyline';
            break;

          case 'polygon':
            geotype = 'POLYGON';
            commontype = 'polygon';
            break;

          default:
            return;
        }
      }

      shiftKey = shiftKey || false;
      ctrlKey = ctrlKey || false;
      metaKey = metaKey || false;

      this.selectDijit.drawBox.onDrawEnd(graphic, geotype, commontype, shiftKey, ctrlKey, metaKey);
    }

    ///////////////////////// END OF ECAN CHANGES //////////////////////////

  });
});
