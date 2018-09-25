define([
    'dojo/_base/declare', 
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/_base/array',
    'dojo/on',
    "dojo/aspect",    
    'dojo/promise/all',
    'dijit/_WidgetsInTemplateMixin',
    "dojo/i18n",

    "dojo/dom-construct",
    'dojo/dom-style',

    'jimu/BaseWidget',
    'jimu/WidgetManager',
    'jimu/dijit/TabContainer3',

    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/layers/FeatureLayer",
    "esri/dijit/editing/TemplatePicker",
    "esri/dijit/AttributeInspector",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/toolbars/draw",
    "esri/toolbars/edit",    
    'esri/urlUtils',
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",

    './components/createFeaturePane',
    './components/editFeaturePane',
    './components/searchFeaturePane',
    './components/createLLURFeaturePopup'
],
function(
    declare, lang, html, arrayUtils, on, aspect, all, 
    _WidgetsInTemplateMixin, 
    i18n,

    domConstruct,
    domStyle,

    BaseWidget,
    WidgetManager,
    TabContainer3,

    Graphic,
    GraphicsLayer,
    FeatureLayer,
    TemplatePicker,
    AttributeInspector,
    Query,
    QueryTask,
    Draw,
    Edit,
    esriUrlUtils,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    Color,

    CreateFeaturePane,
    EditFeaturePane,
    SearchFeaturePane,
    CreateLLURFeaturePopup
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    name: 'LLUREditor',
    baseClass: 'llur-editor',
    // this property is set by the framework when widget is loaded.
    // name: 'LLUREditor',
    // add additional properties here

    tabContainer: null,
    createFeaturePane: null,
    editFeaturePane: null,
    searchFeaturePane: null,

    _attrInspIsCurrentlyDisplayed: false,


    displayLayerOnWidgetClose: false,
    displayLayer: null,

    recordTemplateLayers: null,

    currentFeatures: [],
    currentFeature: null,



    //methods to communication with app container:
    postMixInProperties: function() {
        this.inherited(arguments);
        lang.mixin(this.nls, window.jimuNls.common);
    },

    postCreate: function() {
        this.inherited(arguments);
    },

    startup: function() {
        this.inherited(arguments);

        //setup ui
        this._initTabs();
        this.createFeaturePane.startup();
        this.editFeaturePane.startup();
        //this.searchFeaturePane.startup();

        //check for any url query parameters
        this._checkURLParameters();
    },

    onOpen: function(){
        this._changeDisplayLayerVisibility(true);
        console.log('LLUREditor::onOpen');
    },

    onClose: function(){
        this._mapClickHandler(false);
        this._changeDisplayLayerVisibility(false);
        console.log('LLUREditor::onClose');
    },

    // onMinimize: function(){
    //   console.log('LLUREditor::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('LLUREditor::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('LLUREditor::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('LLUREditor::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('LLUREditor::onPositionChange');
    // },

    // resize: function(){
    //   console.log('LLUREditor::resize');
    // }


    //methods to communication between widgets:


    /*---------------------------------------------------------
      URL FUNCTIONS */


    //extract settings from URL
    _checkURLParameters: function () {
        var loc = window.location;
        var urlObject = esriUrlUtils.urlToObject(loc.href);

        // Check for filter
        if (urlObject.query !== null) {
            //check for single id parameter
            var valuesQuery = urlObject.query["llur"];
            if (valuesQuery) {
                var value = this._getURLParams(valuesQuery);
                if (value !== null) {
                    //Check for an existing feature with this id
                    this._checkExistingFeature(value);
                }
            }

            //check for location id and entity id parameters
            var idQuery = urlObject.query["locationId"];
            var typeQuery = urlObject.query["locationType"];




        }
    },

    _getURLParams: function (entitytype,locationid) {
        var lookupValue = null;
        if (entitytype) {
            //match against configured layer settings
            arrayUtils.forEach( this.recordTemplateLayers, lang.hitch(this, 
                function (recordTemplate) {
                    for(var i=0,ii=recordTemplate.lookupPatterns.length;i<ii;i++) {
                        var exp = new RegExp(recordTemplate.lookupPatterns[i].pattern);
                        if (exp.test(entitytype)) {
                            var exp2 = new RegExp(recordTemplate.lookupPatterns[i].format);
                            lookupValue = {
                                "lookupValue": entitytype.replace(exp2,''),
                                "template": recordTemplate
                            };
                            break;
                        }
                    }
                })
            );
        }
        return lookupValue;
    },

    //make a call to gis service to retrieve an existing feature
    _checkExistingFeature: function (queryItem) {
        if (queryItem && queryItem.lookupValue && queryItem.template) {
            if (!queryItem.queryTask) {
                queryItem.queryTask = new QueryTask(queryItem.template.lookupUrl);
            }

            var q = new Query();
            q.where = queryItem.template.lookupKeyField + " = " + queryItem.lookupValue; 
            q.returnGeometry = true;
            q.outFields = ["*"];
            queryItem.queryTask.execute(q, 
                lang.hitch(this, this._checkExistingFeatureResult), 
                lang.hitch(this, this._requestError)
            );
        }
    },

    //handles result received from existing feature check
    _checkExistingFeatureResult: function (result) {
        if (result && result.features.length > 0) {
            // Get the first shape
            var record = result.features[0];

            //get the record sub type



            // Zoom to shape extent
            this._prepareRecord()
        } else {
            alert('No Record found');
        }
    },

    _requestError: function (error) {

    },


    /*---------------------------------------------------------
      RECORD FUNCTIONS */

    _prepareRecord: function (shape, attributes, template) {
        if (shape) {
            var recordTemplate = null;

            //prepare template if not specified - use template picker current selection
            if (!template) {
                // Get current selected template
                template = this.createFeaturePane.templatePicker.getSelected();   
                if (template) {
                    recordTemplate = this._getRecordTemplate(template.featureLayer.url);
                } else {
                    console.log('LLUREditor::_prepareRecord::No selected template');
                    return;
                }
            } else {
                if (template.featureLayer) {
                    recordTemplate = this._getRecordTemplate(template.featureLayer.url);
                } else {
                    recordTemplate = template;
                }
            }

            //prepare display layer
            if (!recordTemplate.displayLayer) {
                recordTemplate.displayLayer = this._cloneLayer(recordTemplate.layer);
                var cacheLayerHandler = on(recordTemplate.displayLayer, "load", lang.hitch(this, function () {
                        cacheLayerHandler.remove();

                        recordTemplate.displayLayer.setSelectionSymbol(this._getSelectionSymbol(recordTemplate.displayLayer.geometryType, true));

                        this._prepareRecord(shape,attributes,template);
                    })
                );
                return;
            }

            if (this.displayLayer === null || this.displayLayer !== recordTemplate.displayLayer) {
                this._removeDisplayLayer(); 

                this.displayLayer = recordTemplate.displayLayer;
                this.map.addLayer(this.displayLayer);
                this.displayLayer.show();

                //update the current record template
                this.editFeaturePane.setEditFeature(recordTemplate);                
            }

            if (!template.template) {
                template.template = template.displayLayer.types[0].templates[0];
            }


            var newAttributes = lang.clone(template.template.prototype.attributes);
            var newGraphic = new Graphic(shape, null, newAttributes);

            this.displayLayer.applyEdits([newGraphic], null, null, lang.hitch(this, function (e) {
                var queryTask = new Query();
                queryTask.objectIds = [e[0].objectId];
                this.displayLayer.selectFeatures(queryTask, FeatureLayer.SELECTION_NEW, lang.hitch(this,
                    function (result) {
                        this.currentFeatures = result;
                        this.currentFeature = result[0];

                        this.editFeaturePane._updateAttributeEditorFields();

                        //update editPane to current graphic
                        this.tabContainer.selectTab(this.nls.tabs.edit);
                        var ext = shape.getExtent();
                        this.map.setExtent(ext,true);

                    })
                );
            }));
        } else {
            console.log('LLUREditor::_prepareRecord::Invalid parameters');
        }
    },

    //convert a featureset of results to a new LLUR record 
    copyFeatureSet: function (featureset) {
        if (this.map.infoWindow.isShowing) {
            this.map.infoWindow.hide();
        }

        if (featureset && featureset.features && featureset.features.length > 0) {
            this.showCreatePopup(featureset);
        } else {
            alert('LLUR Edit Tool - Invalid features supplied.');
        }
    },

    editRecord: function (featureSet) {
        alert('Put edit stuff here !!!');
    },

    showCreatePopup: function (featureSet) {
        var copyPopup, param;
        param = {
            map: this.map,
            nls: this.nls,
            config: this.config,
            featureSet: featureSet,
            wabWidget: this
        };

        copyPopup = new CreateLLURFeaturePopup(param);
        copyPopup.startup();

        copyPopup.onOkClick = lang.hitch(this, function() {
        var recordTemplate = copyPopup.getSelectedRecordType();
        if (recordTemplate) {
            if (copyPopup.featureSet.features.length === 1) {
                var shape = copyPopup.featureSet.features[0].geometry;
                this._prepareRecord(shape,null,recordTemplate);
            } else {



            }
        }
        copyPopup.popup.close();
        copyPopup.destroy();
      });
    },

    _removeDisplayLayer: function () {
        if (this.displayLayer && this.displayLayer !== null) {
          this.displayLayer.clearSelection();
          this.displayLayer.clear();
          this.map.removeLayer(this.displayLayer);
          this.displayLayer = null;
        }
        this.updateFeatures = [];
    },

    saveChanges: function () {

    },

    cancelChanges: function () {
        var template = this.editFeaturePane.currentTargetTemplate;

        template.displayLayer.clearSelection;
        template.displayLayer.clear();

        if (this.createFeaturePane.templatePicker) {
            this.createFeaturePane.templatePicker.clearSelection();
        }
        this.tabContainer.selectTab(this.nls.tabs.create);
    },


    /*---------------------------------------------------------
      UI FUNCTIONS */

    //prepare the ui tabs for the various actions
    _initTabs: function () {
        var config = this.config, tabs = [];
        this.createFeaturePane = new CreateFeaturePane({
            wabWidget: this
        }, this.createNode);
        tabs.push({
            title: this.nls.tabs.create,
            content: this.createFeaturePane.domNode
        });

        this.editFeaturePane = new EditFeaturePane({
            wabWidget: this
        }, this.editNode);
        tabs.push({
            title: this.nls.tabs.edit,
            content: this.editFeaturePane.domNode
        });        

        /*
        this.searchFeaturePane = new SearchFeaturePane({
            wabWidget: this
        }, this.searchNode);
        tabs.push({
            title: this.nls.tabs.search,
            content: this.searchFeaturePane.domNode
        });    
        */

        var self = this;
        if (tabs.length > 0) {
            this.tabContainer = new TabContainer3({
                average: true,
                tabs: tabs
                }, this.tabsNode);
            
            try {
                if (tabs.length === 1 && this.tabContainer.controlNode &&
                    this.tabContainer.containerNode) {
                    this.tabContainer.controlNode.style.display = "none";
                    this.tabContainer.containerNode.style.top = "0px";
                }
            } catch(ex1) {

            }
                
            this.own(aspect.after(this.tabContainer,"selectTab",function(title){
                //console.warn("selectTab",title);
                if (self.editPane && title === self.nls.tabs.edit) {
                    this._attrInspIsCurrentlyDisplayed = true;
                } else {
                    this._attrInspIsCurrentlyDisplayed = false;
                }
            },true));
        } else if (tabs.length === 0) {
            this.tabsNode.appendChild(document.createTextNode(this.nls.noOptionsConfigured));
        } 
    },    

    //update the display graphics layer visibility status
    _changeDisplayLayerVisibility: function (showLayer) {
        if (this.displayLayer) {
            if (showLayer && !this.displayLayer.visible) {
                this.displayLayer.show();
            }

            if (!showLayer && this.displayLayer.visible && !this.displayLayerOnWidgetClose) {
                this.displayLayer.hide();
            }
        }
    },



    /*---------------------------------------------------------
      STATEMENT FUNCTIONS */

    requestStatement: function (featureset) {
        alert('Put request statement stuff here !!!');
    },


    /*---------------------------------------------------------
      MAP AND LAYER FUNCTIONS */


    //create a duplicate of the editable layer for local working before sending to service
    _cloneLayer: function (layer) {
        var cloneFeaturelayer;
        var fieldsproc = this._processLayerFields(layer.fields);
        var featureCollection = {
          layerDefinition: {
            "id": 0,
            "name": layer.name + this.nls.editorCache,
            "type": "Feature Layer",
            "displayField": layer.displayField,
            "description": "",
            "copyrightText": "",
            "relationships": [],
            "geometryType": layer.geometryType,
            "minScale": 0,
            "maxScale": 0,
            "extent": layer.fullExtent,
            "drawingInfo": {
              "renderer": layer.renderer,
              "transparency": 0,
              "labelingInfo": null
            },
            "hasAttachments": layer.hasAttachments,
            "htmlPopupType": "esriServerHTMLPopupTypeAsHTMLText",
            "objectIdField": layer.objectIdField,
            "globalIdField": layer.globalIdField,
            "typeIdField": layer.typeIdField,
            "fields": fieldsproc,
            "types": layer.types,
            "templates": layer.templates,
            "capabilities": "Create,Delete,Query,Update,Uploads,Editing",
            "editFieldsInfo": layer.editFieldsInfo === undefined ? null : layer.editFieldsInfo
          }
        };
        var outFields = layer.fields.map(function (f) {
          return f.name;
        });
        cloneFeaturelayer = new FeatureLayer(featureCollection, {
          id: layer.id + "_lfl",
          outFields: outFields
        });
        cloneFeaturelayer.visible = true;
        cloneFeaturelayer.renderer = layer.renderer;
        cloneFeaturelayer.originalLayerId = layer.id;
        cloneFeaturelayer._wabProperties = { isTemporaryLayer: true };
        this.map.addLayer(cloneFeaturelayer);
        return cloneFeaturelayer;
    },

    //function required to add the Range details to a range domain so the layer can be cloned
    _processLayerFields: function (fields) {
        arrayUtils.forEach(fields, function (field) {
            if (field.domain !== undefined && field.domain !== null) {
                if (field.domain.type !== undefined && field.domain.type !== null) {
                    if (field.domain.type === 'range') {
                        if (field.domain.hasOwnProperty('range') === false) {
                            field.domain.range = [field.domain.minValue, field.domain.maxValue];
                        }
                    }
                }
            }
        });
        return fields;
    },

    //
    _mapClickHandler: function (create) {
        if (create === true && this._attrInspIsCurrentlyDisplayed === false) {
            this.map.setInfoWindowOnClick(false);
            if (this._mapClick === undefined || this._mapClick === null) {
                this._mapClick = on(this.map, "click", lang.hitch(this, this._onMapClick));
            }
        }
        else if (create === true && this._attrInspIsCurrentlyDisplayed === true) {
            if (this._mapClick) {
                this._mapClick.remove();
                this._mapClick = null;
            }
            this.map.setInfoWindowOnClick(true);
        }
        else {
            if (this._mapClick) {
                this._mapClick.remove();
                this._mapClick = null;
            }
            this.map.setInfoWindowOnClick(true);
            if (this.createFeaturePane && this.createFeaturePane.drawToolbar) {
                this.createFeaturePane.drawToolbar.deactivate();
            }
        }
    },

    _getSelectionSymbol: function (geometryType, highlight) {
        if (!geometryType || geometryType === "") { return null; }

        var selectionSymbol;
        switch (geometryType) {
            case "esriGeometryPoint":
                if (highlight === true) {
                    selectionSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,
                    20,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([0, 230, 169, 1]), 2),
                        new Color([0, 230, 169, 0.65]));
                } else {
                    selectionSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,
                    20,
                    new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([92, 92, 92, 1]), 2),
                        new Color([255, 255, 0, 0.65]));
                }
                break;
            case "esriGeometryPolyline":
                if (highlight === true) {
                    selectionSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([0, 255, 255, 0.65]), 2);
                } else {
                    selectionSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([255, 255, 0, 0.65]), 2);
                }
                break;
            case "esriGeometryPolygon":
                var line;
                if (highlight === true) {
                    selectionSymbol = new SimpleFillSymbol().setColor(new Color([0, 230, 169, 0.65]));
                    line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([192, 192, 192, 1]), 2);
                } else { // yellow with black outline
                    selectionSymbol = new SimpleFillSymbol().setColor(new Color([255, 255, 0, 0.65]));
                    line = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                        new Color([192, 192, 192, 1]), 2);
                }
                selectionSymbol.setOutline(line);
                break;
        }
        return selectionSymbol;
    },


    /*---------------------------------------------------------
      CONFIGURATION */

    //setup the list of layers that the widget has been configured for
    _getConfigTemplates: function () {
        if (this.recordTemplateLayers !== null) return;

        var layers = [];
        arrayUtils.forEach( this.config.recordTemplates, 
           lang.hitch(this, function (recordTemplate) {
                var layer = new FeatureLayer(recordTemplate.layerUrl, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["*"],
                    name: recordTemplate.title,
                    id: recordTemplate.title + '_edit',
                    visible: true,
                    opacity: 0.65
                });

                var item = lang.clone(recordTemplate);
                item.layer = layer;
                layers.push(item);
            })
        );

        this.recordTemplateLayers = layers;
    },

    //return record template withthe given url
    _getRecordTemplate: function (layerUrl) {
        var recordTemplates = arrayUtils.filter(this.recordTemplateLayers, function (item) { return item.layerUrl === layerUrl; });
        return recordTemplates[0];
    }

  });

});
