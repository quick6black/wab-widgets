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
    'dojo/topic',
    'dojo/request',
    'dojo/request/xhr',
    'dojo/Deferred',
    'dojo/json',

    "dojo/dom-construct",
    'dojo/dom-style',

    'jimu/BaseWidget',
    'jimu/WidgetManager',
    'jimu/dijit/TabContainer3',
    'jimu/dijit/AGOLLoading',
    'jimu/portalUtils',

    "esri/geometry/geometryEngine",
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
    'esri/graphicsUtils',
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/Color",
    "esri/request",

    './components/createFeaturePane',
    './components/editFeaturePane',
    './components/searchFeaturePane',
    './components/createLLURFeaturePopup',

    './libs/automapper',

    './libs/terraformer'
],
function(
    declare, lang, html, arrayUtils, on, aspect, all, 
    _WidgetsInTemplateMixin, 
    i18n, topic,
    request, xhr, Deferred, JSON,

    domConstruct,
    domStyle,

    BaseWidget,
    WidgetManager,
    TabContainer3,
    AGOLLoading,
    jimuPortalUtils,

    geometryEngine,
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
    graphicsUtils,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    Color,
    esriRequest,

    CreateFeaturePane,
    EditFeaturePane,
    SearchFeaturePane,
    CreateLLURFeaturePopup,

    automapperUtil,
    Terraformer
) {
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    name: 'LLUREditor',
    baseClass: 'llur-editor',
    // this property is set by the framework when widget is loaded.
    // name: 'LLUREditor',
    // add additional properties here

    tabContainer: null,
    loadingDijit: null,
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

        if (!window.Terraformer.ArcGIS) {
            //load the arcgis and wkt plugins for terraformer - wait until terraformer has loaded before trying this
            var arcgisPath = './' + this.amdFolder + 'libs/terraformer-arcgis-parser.js';
            var wktPath = './' + this.amdFolder + 'libs/terraformer-wkt-parser.js';
            require([arcgisPath,wktPath], 
                function () {
                    // terraformer plugins loaded
                }
            );
        }

        //ready automapper for class conversion
        this._prepareAutomapper();
    },

    startup: function() {
        this.inherited(arguments);

        //setup ui
        this._initTabs();
        this.createFeaturePane.startup();
        this.editFeaturePane.startup();
        //this.searchFeaturePane.startup();

        //Load up editor layer for submitting
        this._prepEditorService();

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
        var value = null; 

        // Check for filter
        if (urlObject.query !== null) {
            //check for single id parameter
            var valuesQuery = urlObject.query["llur"];
            if (valuesQuery) {
                value = this._getURLParams(valuesQuery);
                if (value !== null) {
                    //Check for an existing feature with this id
                    this._checkExistingFeature(value);
                    return;
                }
            }

            //check for location id and entity id parameters
            var idQuery = urlObject.query["locationId"];
            var typeQuery = urlObject.query["locationType"];
            if (idQuery && typeQuery) {
                value = this._getURLParams(typeQuery,idQuery);
                if (value !== null) {
                    //Check for an existing feature with this id
                    this._checkExistingFeature(value);
                    return;
                }
            }
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
                            if (recordTemplate.lookupPatterns[i].format) {
                                var exp2 = new RegExp(recordTemplate.lookupPatterns[i].format);
                                lookupValue = {
                                    "lookupValue": entitytype.replace(exp2,''),
                                    "template": recordTemplate
                                };
                            } else {
                                lookupValue = {
                                    "lookupValue": locationid,
                                    "template": recordTemplate
                                };
                            }
                            break;
                        }
                    }
                })
            );
        }
        return lookupValue;
    },

    //make a call to gis service to retrieve an existing feature
    _checkExistingFeature: function (queryItem, forceEdit) {
        if (queryItem && queryItem.lookupValue && queryItem.template) {
            //check if featurelayer loaded
            var layer = queryItem.template.layer;           
            if (!layer.loaded) {
                layer.on('load', lang.hitch(this, function(event) {
                    this._checkExistingFeature(queryItem);
                }));
                return;
            }

            if (!queryItem.queryTask) {
                queryItem.queryTask = new QueryTask(queryItem.template.lookupUrl);
            }

            var q = new Query();
            q.where = queryItem.template.lookupKeyField + " = " + queryItem.lookupValue; 
            q.returnGeometry = true;
            q.outFields = ["*"];
            queryItem.queryTask.execute(q, 
                lang.hitch(this, function(result) {
                    if (result && result.features.length > 0) {

                        //get the first shape
                        var record = result.features[0];

                        //check if type of record specified
                        var template = null;
                        var attributes = null
                        if (queryItem.template.lookupTypeField) {
                            //find the template type associated with this value
                            var typeId = record.attributes[queryItem.template.lookupTypeField];

                            arrayUtils.forEach(layer.types, lang.hitch(this, 
                                function (layerType) {
                                    if (layerType.id === typeId) {
                                        template = layerType.templates[0];
                                        attributes = lang.clone(template.prototype.attributes);
                                    }                            
                                })
                            );
                        } else {
                            //select first template
                        }

                        //set default attributes
                        attributes["ID"] = queryItem.lookupValue;

                        //check if edit or view
                        var loc = window.location;
                        var urlObject = esriUrlUtils.urlToObject(loc.href);                       
                        if ((urlObject.query && urlObject.query["editMode"]) || forceEdit === true) {
                            //zoom to shape extent
                            this._prepareRecord(record.geometry, attributes, queryItem.template, true);
                        } else {
                            //call the search widget find method
                            topic.publish('publishData', 'framework', 'framework', {
                              searchString: queryItem.lookupValue
                            }, true);
                        }
                    } else {
                        alert('No Record found');
                    }                    
                }), 
                lang.hitch(this, this._requestError)
            );
        }
    },

    _requestError: function (error) {

    },


    /*---------------------------------------------------------
      RECORD FUNCTIONS */

    //ready the layer to update the primary GIS features 
    _prepEditorService: function () {
        if (!this._geometryLayer) {
            //create the layer reference
            this._geometryLayer = new FeatureLayer(this.config.llurGeometryURL, {
                mode: FeatureLayer.MODE_ONDEMAND,
                outFields: ["*"]                
            });

            var geoLoaded = this._geometryLayer.on("load", 
                lang.hitch(this, 
                    function (event) {
                        geoLoaded.remove();

                        //check functionality includes insert/update
                        var caps = this._geometryLayer.getEditCapabilities();
                        if (!caps.canCreate || !caps.canUpdate) {
                            //disable edit tools


                            //alert user
                            alert("LLUR Edit Widget: Edit capability disabled. Some functionality will not work as expected.");
                        }
                    }), 
                lang.hitch(this, 
                    function (error) {
                        console.log('LLUREditor::_prepEditorService::Geometry layer load failed');
                    })
            );
        }
    },

    _prepareRecord: function (shape, attributes, template, featureTemplate) {
        if (shape) {
            var recordTemplate = null;
            var editMode = attributes === null ? "create" : "update";

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

                        this._prepareRecord(shape,attributes,template, featureTemplate);
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
                this.editFeaturePane.setEditFeature(recordTemplate, editMode);                
            }

            if (!template.template) {
                template.template = template.displayLayer.types[0].templates[0];
            }


            var newAttributes = attributes === null ? lang.clone(template.template.prototype.attributes) : attributes;
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

    //trigger an edit action based on a supplied dataset
    editRecord: function (typeQuery, idQuery) {
        var value = this._getURLParams(typeQuery,idQuery);
        if (value !== null) {
            //Check for an existing feature with this id
            this._checkExistingFeature(value, true);
            return;
        }
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
            if (copyPopup.featureSet.features.length === 0) {
                alert('No shapes to copy');
                return;
            }

            var shape = null;
            if (copyPopup.featureSet.features.length === 1) {
                shape = copyPopup.featureSet.features[0].geometry;
            } else {
                var shapes = graphicsUtils.getGeometries(copyPopup.featureSet.features);
                shape = geometryEngine.union(shapes);
            }
            this._prepareRecord(shape,null,recordTemplate);
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

    saveChanges: function (editRecord, apiRecord) {
        
        
        //temp -for testing api
        //editRecord.attributes["ID"] = 166593;
        //apiRecord.id = 166593;

        //this.token = 'Bearer bZy3awf0Ox_JN5zUgNNPbCQHu-dJG2SjHWKKMoSS-HFBxK_YEnweeC9WcJxkaelnF8nIojDM2oErvF-F9QJRARfyLEpABAErMEHEMwAsakicSRKeQLRhqHz_7mhj7D13mAF_Pm87fBm86jeGf2c6zpVW5L2nHhPpkqM83z20cSAzba_1yIENmplaBTbB7fCn6XmXjsR56XfLXNT2CdhCTSqE7792Kppv7ORCSXvOCA60-eWGguWFSfzi7Yqh4TSiRjwcDCgTfDwxP6jYn2_wBB9j3OW2RkhHFYpcDLmkC0Upwk7dNpRjWY8sVoPvv0_JFAT51sY4tWvEpI72Gn7K9xfToRYmGFciO_c9PTHpGnA';
        this.token = this.tokenText.value;

        //Check is this update or new record
        if (editRecord && editRecord.attributes["ID"] !== null) {
            this._changeEditToolState(false, "Starting Update Process");

            //confirm the current record exists and get the current model
            this._requestLLUREntity(apiRecord).then(
                    lang.hitch(this, function (response) {
                        //if valid record found
                        if (response.data !== null) {
                            //generate a shape dto to send through as an update
                            var shapeDto = automapperUtil.map('graphic','shapeDto', editRecord);

                            //update user details
                            shapeDto.createdBy = response.data.createdBy;
                            shapeDto.createdDate = response.data.createdDate;

                            var user = jimuPortalUtils.portals[0].getUser()
                                .then(lang.hitch(this, 
                                    function (user) {
                                        var now = new Date();
                                        shapeDto.modifiedBy = user.credential.userId;
                                        shapeDto.modifiedDate = now.toISOString();

                                        this._putExistingAPIEntity(shapeDto, this.token)
                                            .then(
                                                lang.hitch(this, 
                                                    function (result) { 
                                                        var r = 0;
                                                        //---temp - submit changes to geometry layer - this will normally be called after changes submitted to llur api successfully
                                                        this._postGeometryChanges(editRecord);
                                                    }),
                                                lang.hitch(this, 
                                                    function (error) {
                                                        var e = 0;
                                                    })
                                            );
                                    })
                                );
                        }
                    }),
                    lang.hitch(this, function (error) {
                        console.error(error);
                        this._changeEditToolState(true);
                    })
                );
        } else {
            this._changeEditToolState(false, "Starting Save New Record Process");

            //get the template for the rec type - match against configured layer settings
            var template = null;
            arrayUtils.forEach( this.recordTemplateLayers, lang.hitch(this, 
                function (recordTemplate) {
                    if (recordTemplate.apiSettings.mappingClass === apiRecord.entTypeId) {
                        template = recordTemplate;
                    }
                })
            );

            //post entity to api and await response
            this._postNewAPIEntity(apiRecord, template.apiSettings.controller, this.token)
                .then(
                    lang.hitch(this, function (result) {
                        this._postGeometryChanges(editRecord);
                    }),
                    lang.hitch(this, function (error) {
                        alert(error.message);
                        this._changeEditToolState(true);
                    })
                );
        }
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

    //post the data to tye LLUR Geometry layer
    _postGeometryChanges: function (rec) {
        if (this._geometryLayer) {
            var feature = new Graphic(rec.toJson()), 
                newAttributes = automapperUtil.map('graphic','llurGeoFeature', rec);

            //update feature roperties
            feature.setAttributes(newAttributes);
            feature.setSymbol(null);
            this._updateGeometryProperties(feature);

            var inserts = null, updates = null, deletes = null;

            if (feature.attributes["ID"] === null) {
                //insert as new feature
                inserts = [rec];
            } else {
                //update existing feature
                updates = [rec];
            }

            this._geometryLayer.applyEdits(inserts, updates, deletes, 
                lang.hitch(this, 
                    function (results) {
                        this.tabContainer.selectTab(this.nls.tabs.create);                        
                        this._changeEditToolState(true);
                    }),
                lang.hitch(this, 
                    function (error) {
                        alert(error.message);
                        this._changeEditToolState(true);
                    })
                );
        }
    },

    //update geometry properties
    _updateGeometryProperties: function (rec) {
        if (rec) {
            var area = geometryEngine.planarArea(rec.geometry, 'square-meters');
            var perimeter = geometryEngine.planarLength(rec.geometry, 'meters');

            rec.attributes["AREA_M2"] = area;
            rec.attributes["AREA_HA"] = area/10000;
            rec.attributes["PERIMETER_M"] = perimeter;
        }
    },


    /*---------------------------------------------------------
      LLUR API FUNCTIONS */

    _requestLLUREntity: function (rec) {
        //get the template for the rec type - match against configured layer settings
        var template = null;
        arrayUtils.forEach( this.recordTemplateLayers, lang.hitch(this, 
            function (recordTemplate) {
                if (recordTemplate.apiSettings.mappingClass === rec.entTypeId) {
                    template = recordTemplate;
                }
            })
        );
 
        //if valid template found
        if (template) {
            return this._requestAPIEntityGet(rec, template.apiSettings.controller, this.token);
        } else {
            alert('Invalid record requested');
            return null;
        }
    },

    _requestAPIEntityGet: function (rec, entType, token) {
        var deferred = new Deferred();

        var url = this.config.llurAPI.apiBaseURL + '/' + entType + '/?entityId=' + rec.id;

        //append proxy - requires call be made via proxy
        url = this.appConfig.httpProxy.url + '?' + url; 

        //construct request
        var entityRequest = request(url, {
            method: 'GET',
            handleAs: 'json',
            callbackParameter: 'callback',
            headers: {
                'Authorization': token
            }
        });

        //make request
        entityRequest.response.then(
            function (response) {
                deferred.resolve(response);
            },
            function (response) {
                deferred.reject(response);
            }
        );

        return deferred.promise;
    },

    _postNewAPIEntity: function (rec, entType, token) {
        var deferred = new Deferred();

        var url = this.config.llurAPI.apiBaseURL + '/ECanMaps/' + entType + 's';

        //append proxy - requires call be made via proxy
        url = this.appConfig.httpProxy.url + '?' + url; 

        //construct request
        /*
        var entityRequest = request(url, {
            method: 'POST',
            handleAs: 'json',
            callbackParameter: 'callback',
            headers: {
                'Authorization': token
            },
            data: rec,
            preventCache: true
        });
        */
        var entityRequest = request(url, {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            data: JSON.stringify(rec)
        });


        //make request
        entityRequest.response.then(
            function (response) {
                deferred.resolve(response);
            },
            function (response) {
                deferred.reject(response);
            }
        );

        return deferred.promise;
    },

    _putExistingAPIEntity: function (rec, token) {
        var deferred = new Deferred();

        var entType = null;
        if (rec.entTypeId === 'ACT') entType = 'Activities';
        if (rec.entTypeId === 'SIT') entType = 'Sites';
        if (rec.entTypeId === 'INV') entType = 'Investigations';
        if (rec.entTypeId === 'ENQ') entType = 'Enquiries';
        if (rec.entTypeId === 'COM') entType = 'Communications';

        var url = this.config.llurAPI.apiBaseURL + '/ECanMaps/' + entType + '/' + rec.id;

        //append proxy - requires call be made via proxy
        url = this.appConfig.httpProxy.url + '?' + url; 

        //construct request
        var data = {
            locationId: rec.id,
            eCanMapsLocationShapeDto: rec
        };

        /*

        var entityRequest =  request(url, {
            method: 'PUT',
            headers: {
                'Authorization': token
            },
            data: JSON.stringify(data)
        });

        **/

        var entityRequest = xhr.put(url, {
            headers: {
                'Authorization': token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify(rec),
            handleAs: 'json'
        });

        //make request
        entityRequest.response.then(
            function (response) {
                deferred.resolve(response);
            },
            function (response) {
                deferred.reject(response);
            }
        );

        return deferred.promise;
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

    //change display status of edit tools
    _changeEditToolState: function (show, message) {
        if (this.tabContainer) {

            if (!this.loadingDijit) {
                this.loadingDijit = new AGOLLoading({hidden: true});
                this.loadingDijit.placeAt(this.workingNode);            
            }

            if (show) {
                this.loadingDijit.hide();
                domStyle.set(this.tabContainer.domNode, "display", "block");
            } else {
                this.loadingDijit.show(message);
                domStyle.set(this.tabContainer.domNode, "display", "none");
            } 
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
        this._changeEditToolState(false, "Requesting Statement");

        //submit request
        setTimeout(lang.hitch(this, function () {
            this._changeEditToolState(true);
            alert("You will get the statement here");
        }), 1000);
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

    //prep the automapper settings used in the widget
    _prepareAutomapper: function () {
        //fieldconfig map to field
        automapperUtil.createMap('fieldConfig','field')
            .forMember('fieldName', function (opts) { opts.mapFrom('fieldName'); })
            .forMember('label', function (opts) { opts.mapFrom('label'); })
            .forMember('isEditable', function (opts) { opts.mapFrom('isEditable'); })
            .forMember('tooltip', function (opts) { opts.mapFrom('tooltip'); })
            .forMember('visible', function (opts) { opts.mapFrom('visible'); })
            .forMember('stringFieldOption', function (opts) { opts.mapFrom('stringFieldOption'); })
            .forMember('format', function (opts) { opts.mapFrom('format'); })
            .forMember('editModeVisible', function (opts) { opts.ignore(); })
            .forMember('editModeIsEditable', function (opts) { opts.ignore(); });

        //fieldconfig map to fieldwith EditMode settings
        automapperUtil.createMap('fieldConfig','fieldEditMode')
            .forMember('fieldName', function (opts) { opts.mapFrom('fieldName'); })
            .forMember('label', function (opts) { opts.mapFrom('label'); })
            .forMember('isEditable', function (opts) { opts.mapFrom('editModeIsEditable'); })
            .forMember('tooltip', function (opts) { opts.mapFrom('tooltip'); })
            .forMember('visible', function (opts) { opts.mapFrom('editModeVisible'); })
            .forMember('stringFieldOption', function (opts) { opts.mapFrom('stringFieldOption'); })
            .forMember('format', function (opts) { opts.mapFrom('format'); });
            //.forMember('editModeVisible', function (opts) { opts.ignore(); })
            //.forMember('editModeIsEditable', function (opts) { opts.ignore(); })
    

        //feature to ECanMapsLocationShape entitydto
        automapperUtil.createMap('graphic','ECanMaps')
            .forMember('id', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('entTypeId', function (opts) { return 'ACT'; })
            .forMember('cSID', function (opts) { return null; })
            .forMember('shape', lang.hitch(this, function (opts) { return this._getWKT(opts.sourceObject.geometry); }))
            .forMember('xMin', function (opts) { return opts.sourceObject._extent.xmin; })
            .forMember('xMax', function (opts) { return opts.sourceObject._extent.xmax; })
            .forMember('yMin', function (opts) { return opts.sourceObject._extent.ymin; })
            .forMember('yMax', function (opts) { return opts.sourceObject._extent.ymax; })
            .forMember('title', function (opts) { return opts.sourceObject.attributes["Title"]; })
            .forMember('location', function (opts) { return opts.sourceObject.attributes["Location"]; })
            .forMember('periodFrom', function (opts) { return opts.sourceObject.attributes["PeriodFrom"]; })
            .forMember('periodTo', function (opts) { return opts.sourceObject.attributes["PeriodTo"]; })
            .forMember('activityTypeId', function (opts) { return opts.sourceObject.attributes["ActivityType"]; })
            .forMember('active', function (opts) { return null; })
            .ignoreAllNonExisting();


        //activity feature to ACT entitydto
        automapperUtil.createMap('graphic','ACT')
            .forMember('id', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('entTypeId', function (opts) { return 'ACT'; })
            .forMember('cSID', function (opts) { return null; })
            .forMember('shape', lang.hitch(this, function (opts) { return this._getWKT(opts.sourceObject.geometry); }))
            .forMember('xMin', function (opts) { return opts.sourceObject._extent.xmin; })
            .forMember('xMax', function (opts) { return opts.sourceObject._extent.xmax; })
            .forMember('yMin', function (opts) { return opts.sourceObject._extent.ymin; })
            .forMember('yMax', function (opts) { return opts.sourceObject._extent.ymax; })
            .forMember('title', function (opts) { return opts.sourceObject.attributes["Title"]; })
            .forMember('location', function (opts) { return opts.sourceObject.attributes["Location"]; })
            .forMember('periodFrom', function (opts) { return opts.sourceObject.attributes["PeriodFrom"]; })
            .forMember('periodTo', function (opts) { return opts.sourceObject.attributes["PeriodTo"]; })
            .forMember('activityTypeId', function (opts) { return opts.sourceObject.attributes["ActivityType"]; })
            .forMember('active', function (opts) { return null; })
            .ignoreAllNonExisting();

        //site feature to SIT entitydto
        automapperUtil.createMap('graphic','SIT')
            .forMember('id', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('entTypeId', function (opts) { return 'SIT'; })
            .forMember('cSID', function (opts) { return null; })
            .forMember('shape', lang.hitch(this, function (opts) { return this._getWKT(opts.sourceObject.geometry); }))
            .forMember('xMin', function (opts) { return opts.sourceObject._extent.xmin; })
            .forMember('xMax', function (opts) { return opts.sourceObject._extent.xmax; })
            .forMember('yMin', function (opts) { return opts.sourceObject._extent.ymin; })
            .forMember('yMax', function (opts) { return opts.sourceObject._extent.ymax; })
            .forMember('title', function (opts) { return opts.sourceObject.attributes["Title"]; })
            .forMember('location', function (opts) { return opts.sourceObject.attributes["Location"]; })
            .forMember('riskId', function (opts) { null; })
            .forMember('fileNo', function (opts) { return null; })
            .forMember('categoryId', function (opts) { return opts.sourceObject.attributes["CategoryType"]; })
            .forMember('active', function (opts) { return null; })
            .forMember('previousId', function (opts) { return null; })
            .ignoreAllNonExisting();

        //edit feature to geometry feature attributes
        automapperUtil.createMap('graphic','llurGeoFeature')
            .forMember('ID', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('EntType_ID', function (opts) { 
                var entType = null;
                if (typeof opts.sourceObject.attributes["ActivityType"] !== 'undefined') entType = 'ACT';
                if (typeof opts.sourceObject.attributes["Category"] !== 'undefined') entType = 'SIT';
                if (typeof opts.sourceObject.attributes["InvestigationType"] !== 'undefined') entType = 'INV';
                if (typeof opts.sourceObject.attributes["EnquiryType"] !== 'undefined') entType = 'ENQ';
                if (typeof opts.sourceObject.attributes["CommunicationType"] !== 'undefined') entType = 'COM';
                return entType; })
            .forMember('PERIMETER_M', function (opts) { return null; })
            .forMember('AREA_M2', function (opts) { return null; })
            .forMember('AREA_HA', function (opts) { return null; })
            .forMember('SOURCECODE', function (opts) { return 'MANCAP'; })
            .forMember('QARCODE', function (opts) { return 6; })
            .forMember('CREATEDBY', function (opts) { return null; })
            .forMember('CREATEDDATE', function (opts) { return null; })
            .forMember('MODIFIEDBY', function (opts) { return null; })
            .forMember('MODIFIEDDATE', function (opts) { return null; })
            .ignoreAllNonExisting();


        //site feature to SIT entitydto
        automapperUtil.createMap('graphic','shapeDto')
            .forMember('id', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('entTypeId', function (opts) { 
                var entType = null;
                if (typeof opts.sourceObject.attributes["ActivityType"] !== 'undefined') entType = 'ACT';
                if (typeof opts.sourceObject.attributes["Category"] !== 'undefined') entType = 'SIT';
                if (typeof opts.sourceObject.attributes["InvestigationType"] !== 'undefined') entType = 'INV';
                if (typeof opts.sourceObject.attributes["EnquiryType"] !== 'undefined') entType = 'ENQ';
                if (typeof opts.sourceObject.attributes["CommunicationType"] !== 'undefined') entType = 'COM';
                return entType; })
            .forMember('cSID', function (opts) { return null; })
            .forMember('shape', lang.hitch(this, function (opts) { return this._getWKT(opts.sourceObject.geometry); }))
            .forMember('xMin', function (opts) { return opts.sourceObject._extent.xmin; })
            .forMember('xMax', function (opts) { return opts.sourceObject._extent.xmax; })
            .forMember('yMin', function (opts) { return opts.sourceObject._extent.ymin; })
            .forMember('yMax', function (opts) { return opts.sourceObject._extent.ymax; })
            .forMember('createdBy', function (opts) { return null; })
            .forMember('createdDate', function (opts) { return null; })
            .forMember('modifiedBy', function (opts) { return null; })
            .forMember('modifiedDate', function (opts) { return null; })            
            .ignoreAllNonExisting();
    },


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
    },

    /*---------------------------------------------------------
      UTIL FUNCTIONS */

    _getWKT: function (geometry) {
        if (geometry) {
            var arcgisJson = geometry.toJson();

            var tPrim = window.Terraformer.ArcGIS.parse(geometry.toJson());
            var wkt = window.Terraformer.WKT.convert(tPrim);

            var wktObject = {
                geometry: {
                    wellKnownText: wkt,
                    coordinateSystemId: geometry.spatialReference.wkid
                }
            };

            return wktObject;
        } else {
            return null;
        }
    }

  });

});
