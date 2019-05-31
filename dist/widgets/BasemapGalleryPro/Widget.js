///////////////////////////////////////////////////////////////////////////
// Copyright © Esri. All Rights Reserved.
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

define(['dojo/_base/declare', 'dijit/_WidgetsInTemplateMixin', "dojo/Deferred", 'jimu/BaseWidget', 'jimu/portalUtils', 'jimu/PanelManager', 'jimu/portalUrlUtils', 'jimu/utils', "esri/dijit/Basemap", "esri/dijit/BasemapLayer", 'esri/dijit/BasemapGallery', "./a11y/Widget", 'dojo/_base/lang', 'dojo/_base/array', "dojo/_base/html", "dojo/query", 'dojo/on', 'dojo/promise/all', './utils', 'dojo/dom-class', 'dojo/dom-style', "dijit/form/DropDownButton", 'dijit/DropDownMenu', "dijit/MenuItem", 'jimu/dijit/LoadingIndicator'], function (declare, _WidgetsInTemplateMixin, Deferred, BaseWidget, portalUtils, PanelManager, portalUrlUtils, jimuUtils, Basemap, BasemapLayer, BasemapGallery, a11y, lang, array, html, query, on, all, utils, domClass, domStyle, DropDownButton, DropDownMenu, MenuItem) {
  var clazz = declare([BaseWidget, _WidgetsInTemplateMixin], {

    name: 'BasemapGalleryPro',
    baseClass: 'jimu-widget-basemapgallery-pro',
    basemapGallery: null,
    spatialRef: null,

    /* BEGIN CHANGES: Customisations */

    _useGroups: null,
    _groups: null,
    _groupMenu: null,
    _groupSelector: null,
    _allBasemaps: null,

    /* END CHANGES */

    startup: function startup() {
      /*jshint unused: false*/
      this.inherited(arguments);

      /* BEGIN CHANGE: Apply Basemap Groups */

      this._useGroups = this.config.basemapGallery.useGroups && this.config.basemapGallery.groups && this.config.basemapGallery.groups.length > 0;
      if (this._useGroups) {
        this.initBasemapGroups();
        this._groupMenu = this._createGroupMenu();
        this._createGroupSelector();
        domClass.remove(this.groupSelectContainer, "hidden");
      }

      /* END CHANGE */

      this.initBasemaps();
    },

    resize: function resize() {
      this._responsive();
    },

    _responsive: function _responsive() {
      // the default width of esriBasemapGalleryNode is 85px,
      // margin-left is 10px, margin-right is 10px;
      setTimeout(lang.hitch(this, function () {
        var paneNode = query('#' + this.id)[0];
        var width = html.getStyle(paneNode, 'width');
        var column = parseInt(width / 105, 10);
        if (column > 0) {
          var margin = width % 105;
          var addWidth = parseInt(margin / column, 10);
          query('.esriBasemapGalleryNode', this.id).forEach(function (node) {
            html.setStyle(node, 'width', 85 + addWidth + 'px');
          });
        }
      }), 100);
    },

    initBasemaps: function initBasemaps() {
      var basemapsDef;
      var portalSelfDef;
      var config = lang.clone(this.config.basemapGallery);

      this.loadingShelter.show();
      //load from portal or config file.
      if (config.mode === 1) {
        basemapsDef = utils._loadPortalBaseMaps(this.appConfig.portalUrl, this.map);
      } else {
        basemapsDef = new Deferred();
        basemapsDef.resolve(config.basemaps);
      }

      var portal = portalUtils.getPortal(this.appConfig.portalUrl);
      portalSelfDef = portal.loadSelfInfo();
      all({
        'portalSelf': portalSelfDef,
        'basemaps': basemapsDef
      }).then(lang.hitch(this, function (result) {
        var basemaps = result.basemaps;
        var basemapObjs = [];
        var i = 0;
        var webmapBasemap = this._getWebmapBasemap();

        basemaps = array.filter(basemaps, function (basemap) {
          if (!basemap || !basemap.title) {
            return false;
          }
          var bingKeyResult;
          // first, filter bingMaps
          if (!utils.isBingMap(basemap)) {
            // do not have bingKey and basemap is not bingMap.
            bingKeyResult = true;
          } else if (result.portalSelf.bingKey) {
            // has bingKey, can add any bing map or not;
            bingKeyResult = true;
          } else {
            // do not show basemap if do not has bingKey as well as basemap is bingMap.
            bingKeyResult = false;
          }

          // basemap does not have title means basemap load failed.
          return basemap.title && bingKeyResult;
        }, this);

        // if basemap of current webmap is not include, so add it.
        for (i = 0; i < basemaps.length; i++) {
          if (utils.compareSameBasemapByOrder(basemaps[i], webmapBasemap)) {
            break;
          }
        }
        if (i === basemaps.length) {
          basemaps.push(webmapBasemap);
        }

        for (i = 0; i < basemaps.length; i++) {
          var n = basemaps[i].layers.length;
          var layersArray = [];
          for (var j = 0; j < n; j++) {
            layersArray.push(new BasemapLayer(basemaps[i].layers[j]));
          }
          basemaps[i].layers = layersArray;
          if (!basemaps[i].thumbnailUrl) {
            basemaps[i].thumbnailUrl = this.folderUrl + "images/default.jpg";
          } else {
            var reg = /^(https?:)?\/\//;
            if (reg.test(basemaps[i].thumbnailUrl)) {
              basemaps[i].thumbnailUrl = basemaps[i].thumbnailUrl + utils.getToken(this.appConfig.portalUrl);
            } else {
              basemaps[i].thumbnailUrl = jimuUtils.processUrlInWidgetConfig(basemaps[i].thumbnailUrl, this.folderUrl);
            }
            // else if(basemaps[i].thumbnailUrl.startWith('/') ||
            //   basemaps[i].thumbnailUrl.startWith('data')){
            //   basemaps[i].thumbnailUrl = basemaps[i].thumbnailUrl;
            // }else{
            //   //if path is relative, relative to widget's folder
            //   basemaps[i].thumbnailUrl = this.appUrl + basemaps[i].thumbnailUrl;
            // }
          }
          basemapObjs.push(new Basemap(basemaps[i]));

          /* BEGIN CHANGE: Basemaps function */

          if (this._useGroups) {
            this._addBasemapToGroups(basemaps[i]);
          }

          /* END CHANGE */
        }

        config.map = this.map;
        if (this.appConfig.portalUrl) {
          config.portalUrl = this.appConfig.portalUrl;
        }

        /* BEGIN CHANGE: Basemap groups functions 
        ORIGINAL CODE:
        config.basemaps = basemapObjs;
        */

        this._allBasemaps = [];
        if (this._useGroups) {
          array.forEach(basemapObjs, lang.hitch(this, function (basemap) {
            this._allBasemaps.push(basemap);
          }));

          //reorder basemaps in groups
          for (var groupName in this._groups) {
            this._orderBasemaps(this._groups[groupName]);
          }

          //check for default group
          if (config.defaultBasemapGroup && config.defaultBasemapGroup !== '' && this._groups[config.defaultBasemapGroup]) {
            var group = this._groups[config.defaultBasemapGroup];

            //use group basemaps
            config.basemaps = group.basemaps;

            //update title on group selector
            this._groupSelector.set('label', group.label);
          } else {
            //use all basemaps
            config.basemaps = basemapObjs;
          }
        } else {
          //use all basemaps
          config.basemaps = basemapObjs;
        }

        /* END CHANGE */

        config.showArcGISBasemaps = false;
        config.bingMapsKey = result.portalSelf.bingKey;
        this.basemapGallery = new BasemapGallery(config, this.basemapGalleryDiv);
        this.basemapGallery.startup();
        this.a11y_initGalleryNodesAttrs();
        this.own(on(this.basemapGallery, "selection-change", lang.hitch(this, this.selectionChange)));
        this._responsive();

        this.loadingShelter.hide();
      })).otherwise(lang.hitch(this, function () {
        this.loadingShelter.hide();
      }));
    },

    _getWebmapBasemap: function _getWebmapBasemap() {
      var thumbnailUrl;
      if (this.map.itemInfo.item.thumbnail) {
        thumbnailUrl = portalUrlUtils.getItemUrl(this.appConfig.portalUrl, this.map.itemInfo.item.id) + "/info/" + this.map.itemInfo.item.thumbnail;
      } else {
        thumbnailUrl = null;
      }
      return {
        title: this.map.itemInfo.itemData.baseMap.title,
        thumbnailUrl: thumbnailUrl,
        layers: this.map.itemInfo.itemData.baseMap.baseMapLayers,
        spatialReference: this.map.spatialReference
      };
    },

    selectionChange: function selectionChange() {
      this.updateExtent();

      if (this.gid === 'widgetOnScreen') {
        PanelManager.getInstance().closePanel(this.id + '_panel');
      }
    },

    updateExtent: function updateExtent() {
      if (this.map.getNumLevels() > 0) {
        // Set scale to nearest level of current basemap layer
        var basemap = this.basemapGallery.getSelected();

        /* BEGIN CHANGE: check for vector basemaps 
        // Original Code: 
        var layers = basemap.getLayers();
         */

        var layers;
        if (basemap.layers) {
          layers = basemap.layers;
        } else {
          layers = basemap.getLayers();
        }

        /* END CHANGE */

        var currentLod = this.map.__tileInfo.lods[this.map.getLevel()];
        var layer, tileInfo;

        if (layers.length > 0) {
          layer = layers[0];
          tileInfo = layer.tileInfo || layer.serviceInfoResponse && layer.serviceInfoResponse.tileInfo;
          if (tileInfo && currentLod) {
            // normalize scale
            var mapScale = currentLod.scale / this.map.__tileInfo.dpi;
            var bestScale;
            array.forEach(tileInfo.lods, function (lod) {
              var scale = lod.scale / tileInfo.dpi;
              if (!bestScale || Math.abs(scale - mapScale) < Math.abs(bestScale - mapScale)) {
                bestScale = scale;
              }
            });
            if (Math.abs(bestScale - mapScale) / mapScale > 1 / this.map.width) {
              this.map.setScale(bestScale * tileInfo.dpi);
            }
          }
        }
      }
    },

    /* BEGIN CHANGES: BASEMAPS GROUPING FUNCTIONS */

    initBasemapGroups: function initBasemapGroups() {
      this._groups = {};

      //add unique groups to list
      array.forEach(this.config.basemapGallery.groups, lang.hitch(this, function (group) {
        if (!this._groups.hasOwnProperty(group.id)) {
          this._groups[group.id] = {
            "label": group.label,
            "tag": group.tag,
            "basemaps": [],
            "includedBasemaps": group.includedBasemaps
          };
        }
      }));
    },

    _addBasemapToGroups: function _addBasemapToGroups(basemap) {
      for (var groupName in this._groups) {
        var group = this._groups[groupName];
        if (!group.includedBasemaps) group.includedBasemaps = [];

        //check if basemap contains this tag
        if (basemap && (basemap.tags.indexOf(group.tag) > -1 || group.includedBasemaps.indexOf(basemap.title) > -1)) {
          group.basemaps.push(basemap);
          var i = 0;
        }
      }
    },

    _orderBasemaps: function _orderBasemaps(group) {
      if (group.includedBasemaps && group.includedBasemaps.length > 0) {
        var basemaps = [];

        array.forEach(group.includedBasemaps, function (basemapName) {
          var basemap = group.basemaps.filter(function (basemap) {
            return basemap.title === basemapName;
          })[0];

          if (basemap) basemaps.push(basemap);
        });

        group.basemaps = basemaps;
      }
    },

    _createGroupSelector: function _createGroupSelector() {
      this._groupSelector = new DropDownButton({
        label: this.nls.allBasemapsLabel,
        tooltip: this.nls.basemapGroupChooserTooltip,
        name: "groupSelector",
        id: "groupSelector",
        dropDown: this._groupMenu
      }, this.groupSelectorDiv);
      this._groupSelector.startup();
    },

    _createGroupMenu: function _createGroupMenu() {
      var menu = new DropDownMenu({
        style: "display: none;"
      });

      this._addMenuItem({
        "id": "all",
        "label": this.nls.allBasemapsLabel,
        "tag": ""
      }, menu);

      for (var groupid in this._groups) {
        var group = this._groups[groupid];
        this._addMenuItem(group, menu);
      }

      menu.startup();
      return menu;
    },

    /**
     * This function is used to add the options in menuitem &
     * menuitem into menu object
     */
    _addMenuItem: function _addMenuItem(options, menu) {
      options = lang.mixin(options, {
        onClick: lang.hitch(this, function () {
          this._basemapGroupClick(options);
        })
      });
      var menuItem = new MenuItem(options);
      menu.addChild(menuItem);
    },

    _basemapGroupClick: function _basemapGroupClick(group) {
      this._setBasemapGroup(group);
    },

    _setBasemapGroup: function _setBasemapGroup(group) {
      if (group && group.hasOwnProperty("basemaps") && group.basemaps.length > 0) {
        this._groupSelector.set('label', group.label);
        this._updateBasemaps(group);
      } else {
        //default to show all basemaps
        this._groupSelector.set('label', this.nls.allBasemapsLabel);
        this._updateBasemaps();
      }
    },

    _updateBasemaps: function _updateBasemaps(group) {
      if (!group) {
        group = { "basemaps": this._allBasemaps };
      }

      var adds = [],
          removes = [],
          current = this.basemapGallery.basemaps,
          activeMap = this.basemapGallery.getSelected();

      //get maps to remove from gallery
      array.forEach(current, lang.hitch(this, function (basemap) {
        var isActive = activeMap !== null ? basemap.id === activeMap.id : false;

        var found = group.basemaps.filter(function (groupmap) {
          if (groupmap) {
            return groupmap.title === basemap.title;
          } else {
            return false;
          }
        }).length > 0;

        if (!found && !isActive) removes.push(basemap);
      }));

      //get maps to add to gallery
      array.forEach(group.basemaps, lang.hitch(this, function (groupmap) {
        var found = current.filter(function (basemap) {
          if (groupmap) {
            return groupmap.title === basemap.title;
          } else {
            return false;
          }
        }).length > 0;

        if (!found) adds.push(groupmap);
      }));

      //remove unneeded basemaps
      array.forEach(removes, lang.hitch(this, function (basemap) {
        this.basemapGallery.remove(basemap.id);
      }));

      //add new basemaps
      array.forEach(adds, lang.hitch(this, function (basemap) {
        this.basemapGallery.add(basemap);
      }));
    }

    /* END CHANGES */
  });

  clazz.extend(a11y); //for a11y
  return clazz;
});
