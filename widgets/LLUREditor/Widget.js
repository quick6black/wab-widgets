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
    'jimu/dijit/Message',
    'jimu/portalUtils',
    'jimu/portalUrlUtils',    

    "esri/geometry/geometryEngine",
    "esri/geometry/Extent",
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
    "esri/arcgis/Portal",

    './components/createFeaturePane',
    './components/editFeaturePane',
    './components/searchFeaturePane',
    './components/createLLURFeaturePopup',
    './components/LEFilterEditor',

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
    Message,
    jimuPortalUtils,
    jimuPortalUrlUtils,

    geometryEngine,
    Extent,
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
    arcgisPortal,

    CreateFeaturePane,
    EditFeaturePane,
    SearchFeaturePane,
    CreateLLURFeaturePopup,
    LEFilterEditor,

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
                        this.showMessage('No Record found',"error");
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
                            this.showMessage("LLUR Edit Widget: Edit capability disabled. Some functionality will not work as expected.","error");
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
            }

            //update the current record template
            this.editFeaturePane.setEditFeature(recordTemplate, editMode);                

            if (!template.template) {
                if (template.displayLayer.types.length > 0) {
                    template.template = template.displayLayer.types[0].templates[0];
                } else {
                    template.template = template.displayLayer.templates[0];
                }
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
            console.log('LLUREditor::copyFeatureSet::Invalid features supplied');
            this.showMessage('LLUR Edit Tool - Invalid features supplied.',"error");
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

    //show the create feature popup screen when uisng the create record feature action
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
                this.showMessage('No shapes to copy',"error");
                return;
            }

            //check if multiple features were supplied
            var shape = null;
            if (copyPopup.featureSet.features.length === 1) {
                shape = copyPopup.featureSet.features[0].geometry;
            } else {
                //multiple records - create a single merged shape
                var shapes = graphicsUtils.getGeometries(copyPopup.featureSet.features);
                shape = geometryEngine.union(shapes);
            }
            this._prepareRecord(shape,null,recordTemplate);
        }
        copyPopup.popup.close();
        copyPopup.destroy();
      });
    },

    //show a message box with buttons if necessary
    showMessage : function (msg, type, buttons) {

        var class_icon = "message-info-icon";
        switch (type) {
            case "error":
                class_icon = "message-error-icon";
                break;
            case "warning":
                class_icon = "message-warning-icon";
                break;
        }

        var content = '<i class="' + class_icon + '">&nbsp;</i>' + msg;

        if (buttons === undefined) {
            buttons = [];
        }

        this.message = new Message({
            message : content,
            buttons : buttons
        });
    },

    //destroy the message dijit if instantiated.
    hideMessage : function () {
        if (this.message && this.message.close) {
            this.message.close();
            this.message.destroy();
            this.message = false;
        }
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

    //start save process 
    saveChanges: function (editRecord, apiRecord) {
        //get user and current time details
        var portalUrl = jimuPortalUrlUtils.getStandardPortalUrl(this.appConfig.portalUrl);
        var portal = jimuPortalUtils.getPortal(portalUrl);

        var userName = portal.user !== null ? portal.user.email : 'Unknown';

        var now = new Date();
        now = now.getUTCFullYear() + '-' +
        ('00' + (now.getUTCMonth() + 1)).slice(-2) + '-' +
        ('00' + now.getUTCDate()).slice(-2) + ' ' +
        ('00' + now.getUTCHours()).slice(-2) + ':' +
        ('00' + now.getUTCMinutes()).slice(-2) + ':' +
        ('00' + now.getUTCSeconds()).slice(-2); 

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

                            shapeDto.modifiedBy = userName;
                            shapeDto.modifiedDate = now;

                            this._putExistingAPIEntity(shapeDto)
                                .then(
                                    lang.hitch(this, 
                                        function (result) { 
                                            var r = 0;
                                            //---temp - submit changes to geometry layer - this will normally be called after changes submitted to llur api successfully
                                            this._postGeometryChanges(editRecord, false);
                                        }),
                                    lang.hitch(this, 
                                        function (error) {
                                            if (error) {
                                                this.showMessage(error.message,"error");
                                            } else {
                                                this.showMessage("LLUR Edit Widget: Save Changes putExistingAPIEntity Error","error");
                                            }

                                            this._changeEditToolState(true);
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

            //update user and time on record
            apiRecord.createdBy = userName;
            apiRecord.createdDate = now;

            apiRecord.modifiedBy = userName;
            apiRecord.modifiedDate = now;            

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
            this._postNewAPIEntity(apiRecord, template.apiSettings.controller)
                .then(
                    lang.hitch(this, function (result) {
                        var resultData = result.data;
                        if (resultData.id) {
                            editRecord.attributes["ID"] = resultData.id;
                            editRecord.attributes["EntType_ID"] = resultData.entTypeId;
                        }

                        this._postGeometryChanges(editRecord, true);
                    }),
                    lang.hitch(this, function (error) {
                        this.showMessage(error.message,"error");
                        this._changeEditToolState(true);
                    })
                );
        }
    },

    //abandon the current edit session and reset the tools
    cancelChanges: function () {
        var template = this.editFeaturePane.currentTargetTemplate;

        template.displayLayer.clearSelection;
        template.displayLayer.clear();

        if (this.createFeaturePane.templatePicker) {
            this.createFeaturePane.templatePicker.clearSelection();
            this.createFeaturePane.toggleDrawingToolVisible(false);
        }
        this.tabContainer.selectTab(this.nls.tabs.create);
    },

    //post the data to tye LLUR Geometry layer
    _postGeometryChanges: function (rec, isInsert) {
        if (this._geometryLayer) {
            var feature = new Graphic(rec.toJson()), 
                newAttributes = automapperUtil.map('graphic','llurGeoFeature', rec);

            //update feature roperties
            feature.setAttributes(newAttributes);
            feature.setSymbol(null);
            this._updateGeometryProperties(feature);
            this._updateUserProperties(feature);

            var inserts = null, updates = null, deletes = null;
            var ext = feature.geometry.getExtent().expand(1.5);

            if (feature.attributes["ID"] === null||isInsert) {
                //insert as new feature
                inserts = [feature];

                //send edits to geometry layer
                this._applyGeometryEdits(inserts, updates, deletes, ext);
            } else {
                //update existing feature
                var id = feature.attributes["ID"];
                var enttype = feature.attributes["EntType_ID"];

                this._getObjectID(id,enttype).then(lang.hitch(this, function (objectid) {
                    if (objectid) {
                        feature.attributes["OBJECTID"] = objectid;
                        updates = [feature];
        
                        //send edits to geometry layer
                        this._applyGeometryEdits(inserts, updates, deletes, ext);
                    } else {
                        this.showMessage('LLUR Edit Tool - Object ID Not Found.',"error");
                    }
                }));
            }
        }
    },

    //call the apply edits service for the llur geometry
    _applyGeometryEdits: function (inserts, updates, deletes, extent) {
        this._geometryLayer.applyEdits(inserts, updates, deletes, 
            lang.hitch(this, 
                function (results) {
                    //check if app should redirect to the llur application for a added/modified record
                    if (this.config.redirectToLLUROnComplete) {
                        if (!updates) {
                            updates = [];
                        }

                        var feature = updates.concat(inserts)[0];

                        var id = feature.attributes["ID"];
                        var enttype = feature.attributes["EntType_ID"];

                        var url = this.config.llurApplication.appBaseURL + this.config.llurApplication.appRecordTypeEndpoints[enttype] + id;

                        window.location = url;
                    } else {
                        var template = this.editFeaturePane.currentTargetTemplate;

                        template.displayLayer.clearSelection;
                        template.displayLayer.clear();

                        if (this.createFeaturePane.templatePicker) {
                            this.createFeaturePane.templatePicker.clearSelection();
                        }

                        this.tabContainer.selectTab(this.nls.tabs.create); 
                        this._changeEditToolState(true);

                        if (extent) {
                            this.map.setExtent(extent,true);                        
                        }
                    }
                }),
            lang.hitch(this, 
                function (error) {
                    this.showMessage(error.message,"error");
                    this._changeEditToolState(true);
                })
            );
    },

    //update geometry properties for area and perimeter
    _updateGeometryProperties: function (rec) {
        if (rec) {
            var area = geometryEngine.planarArea(rec.geometry, 'square-meters');
            var perimeter = geometryEngine.planarLength(rec.geometry, 'meters');

            rec.attributes["AREA_M2"] = area;
            rec.attributes["AREA_HA"] = area/10000;
            rec.attributes["PERIMETER_M"] = perimeter;
        }
    },

    //update the user details on the GIS record
    _updateUserProperties: function (rec) {
        if (rec) {
            var portalUrl = jimuPortalUrlUtils.getStandardPortalUrl(this.appConfig.portalUrl);
            var portal = jimuPortalUtils.getPortal(portalUrl);

            var userName = portal.user !== null ? portal.user.email : 'Unknown';
            var currentDate = new Date().valueOf();

            if (rec.attributes["CREATEDBY"] === null){
                rec.attributes["CREATEDBY"] = userName;
                rec.attributes["CREATEDDATE"] = currentDate;
            }

            rec.attributes["MODIFIEDBY"] = userName;
            rec.attributes["MODIFIEDDATE"] = currentDate;
        }
    },

    //return the object id associated with a given llur feature
    _getObjectID: function (id, enttype) {
        var deferred = new Deferred();

        if (this._geometryLayer && id && enttype) {
            var query = new Query();
            query.where = "ID = " + id + " AND EntType_ID = '" + enttype + "'";

            this._geometryLayer.queryIds(query, lang.hitch(this, function(objectIds) {
                deferred.resolve(objectIds[0]);
            }));
        } else {
            deferred.resolve(null);
        }

        return deferred.promise;
    },


    /*---------------------------------------------------------
      LLUR API FUNCTIONS */

    //request an existing feature's details from the LLUR API
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
            return this._requestAPIEntityGet(rec, template.apiSettings.controller);
        } else {
            this.showMessage('Invalid record requested',"error");
            return null;
        }
    },

    //call LLUR API get record
    _requestAPIEntityGet: function (rec, entType) {
        var deferred = new Deferred();

        //set the endpoint url
        var url = this.config.llurAPI.apiBaseURL + '/' + entType + '/?entityId=' + rec.id;

        //append proxy - requires call be made via proxy
        url = this.config.llurAPI.proxy + '?' + url; 

        //construct request
        var entityRequest = request(url, {
            method: 'GET',
            handleAs: 'json',
            callbackParameter: 'callback'
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

    //call LLUR API to create a new database record
    _postNewAPIEntity: function (rec, entType) {
        var deferred = new Deferred();
        entType = this._getEntTypeFromRecord(rec);

        //set the endpoint url
        var url = this.config.llurAPI.apiBaseURL + '/ECanMaps/' + entType;
        
        //append proxy - requires call be made via proxy
        url = this.config.llurAPI.proxy + '?' + url; 

        //construct request
        var entityRequest = request(url, {
            method: 'POST',
            handleAs: 'json',       
            data: JSON.stringify(rec),
            headers: { 'Content-Type': 'application/json' }
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

    //call LLUR API to update an existing database record
    _putExistingAPIEntity: function (rec) {
        var deferred = new Deferred();
        var entType = this._getEntTypeFromRecord(rec);

        //set the endpoint url
        var url = this.config.llurAPI.apiBaseURL + '/ECanMaps/' + entType + '/' + rec.id;

        //add put parameter to signal LLUR Proxy to convert this to a PUT request
        url = url + '?put=true'

        //append proxy - requires call be made via proxy
        url = this.config.llurAPI.proxy + '?' + url; 

        var data = rec;
        var entityRequest = request(url, {
            method: 'POST',
            handleAs: 'json',    
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(data)
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

    //helper methdoi to get the record type endpoint name for the LLUR API
    _getEntTypeFromRecord: function (rec) {
        var entType = null;
        if (rec.entTypeId === 'ACT') entType = 'Activities';
        if (rec.entTypeId === 'SIT') entType = 'Sites';
        if (rec.entTypeId === 'INV') entType = 'Investigations';
        if (rec.entTypeId === 'ENQ') entType = 'Enquiries';
        if (rec.entTypeId === 'COM') entType = 'Communications';
        return entType;
    },


    //call LLUR API to  execute the notify enquirer function
    _postNotifyAPIEntity: function (enquiryId) {
        var deferred = new Deferred();

        //set the endpoint url
        var url = this.config.llurAPI.apiBaseURL + '/Enquiries/' + enquiryId + '/notifyEnquirer';
        
        //append proxy - requires call be made via proxy
        url = this.config.llurAPI.proxy + '?' + url; 

        var params = {
            enquiryId: enquiryId,
            sendEmail: true
        };

        //construct request
        var entityRequest = request(url, {
            method: 'POST',
            data: JSON.stringify(params)
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
                //Do something
            }
                
            this.own(aspect.before(this.tabContainer,"selectTab", lang.hitch(this, function(title){
                if (this.tabContainer.getSelectedTitle() !== title) {
                    if (this.editFeaturePane.editToolbar) {
                        var state = this.editFeaturePane.editToolbar.getCurrentState();
                        if (state.graphic && state.isModified){
                            //incomplete edit - ask to save prior to chnaging tab



                        }
                    }
                }

            }),true));

            this.own(aspect.after(this.tabContainer,"selectTab", lang.hitch(this, function(title){
                //console.warn("selectTab",title);
                if (self.editFeaturePane && title === self.nls.tabs.edit) {
                    this._attrInspIsCurrentlyDisplayed = true;
                } else {
                    this._attrInspIsCurrentlyDisplayed = false;
                }
            }),true));
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

    requestStatement: function (featureSet) {
        //if (this.map.infoWindow.isShowing) {
        //    this.map.infoWindow.hide();
        //}

        if (featureSet && featureSet.features && featureSet.features.length > 0) {
            //set working animation
            this._changeEditToolState(false, "Requesting Statement");

            //confirm enquiry template is configured
            var recordTemplate = this._getRecordTemplate('ENQ');
            if (!recordTemplate) {
                this.showMessage('LLUR Edit Tool - Enquiry functionality not configured.',"error");               
                this._changeEditToolState(true);
                return;
            } 

            //create enquiry record
            var statementTypeId = this.config.llurAPI.statementRequestTypeId;
            var enquiryTemplate = arrayUtils.filter(recordTemplate.layer.types, function (type) { 
                return type.id === statementTypeId;
            })[0];

            if (!enquiryTemplate) {
                this.showMessage('LLUR Edit Tool - Enquiry Statement functionality not configured.',"error");               
                this._changeEditToolState(true);
                return;                
            }

            //check if multiple features were supplied
            var shape = null;
            if (featureSet.features.length === 1) {
                shape = featureSet.features[0].geometry;
            } else {
                //multiple records - create a single merged shape
                var shapes = graphicsUtils.getGeometries(featureSet.features);
                shape = geometryEngine.union(shapes);
            }

            var portalUrl = jimuPortalUrlUtils.getStandardPortalUrl(this.appConfig.portalUrl);
            var portal = jimuPortalUtils.getPortal(portalUrl);

            var userName = portal.user !== null ? portal.user.username : 'Unknown';
            var currentDate = new Date().valueOf();

            var newAttributes = lang.clone(enquiryTemplate.templates[0].prototype.attributes);
            newAttributes["EnquirerName"] = userName;
            newAttributes["NatureOfEnquiry"] = "Self Service Statement Request";
            newAttributes["SearchRaedius"] = 0;
            var newGraphic = new Graphic(shape, null, newAttributes);

            var ext = newGraphic.geometry.getExtent();


            var saveRec = automapperUtil.map('graphic','ENQ', newGraphic);

            //generate a shape dto to send through as an update
            var shapeDto = automapperUtil.map('graphic','shapeDto', newGraphic);

            //update user details
            var now = new Date();
            now = now.getUTCFullYear() + '-' +
            ('00' + (now.getUTCMonth() + 1)).slice(-2) + '-' +
            ('00' + now.getUTCDate()).slice(-2) + ' ' +
            ('00' + now.getUTCHours()).slice(-2) + ':' +
            ('00' + now.getUTCMinutes()).slice(-2) + ':' +
            ('00' + now.getUTCSeconds()).slice(-2);  

            shapeDto.createdBy = userName;
            shapeDto.createdDate = now;
            shapeDto.modifiedBy = userName;
            shapeDto.modifiedDate = now;

            //submit as a new enquiry
            this._putExistingAPIEntity(shapeDto)
                .then(
                    lang.hitch(this, 
                        function (result) { 
                            this._postGeometryChanges(newGraphic, false);

                            //send notify fubnction
                            //this._postNotifyAPIEntity(result.)
                            this.showMessage('you will be emailed statemeent details shortly');

                            this._changeEditToolState(true);
                        }),
                    lang.hitch(this, 
                        function (error) {
                            if (error) {
                                this.showMessage(error.message,"error");
                            } else {
                                this.showMessage('LLUR Edit Tool - Enquiry Statement Save Changes putExistingAPIEntity Error.',"error");               
                            }

                            this._changeEditToolState(true);
                        })
                );

            //var ext = shape.getExtent();
            //this.map.setExtent(ext,true);
        } else {
            console.log('LLUREditor::requestStatement::Invalid features supplied');
            this.showMessage('LLUR Edit Tool - Invalid features supplied to Statement Create.',"error");
        }

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
            /*
            if (this._mapClick === undefined || this._mapClick === null) {
                this._mapClick = on(this.map, "click", lang.hitch(this, this._onMapClick));
            }
            */
        }
        else if (create === true && this._attrInspIsCurrentlyDisplayed === true) {
            /*
            if (this._mapClick) {
                this._mapClick.remove();
                this._mapClick = null;
            }
            */
            this.map.setInfoWindowOnClick(true);
        }
        else {
            /*
            if (this._mapClick) {
                this._mapClick.remove();
                this._mapClick = null;
            }
            */
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
            .forMember('createdBy', function (opts) { return null; })
            .forMember('createdDate', function (opts) { return null; })
            .forMember('modifiedBy', function (opts) { return null; })
            .forMember('modifiedDate', function (opts) { return null; })             
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
            .forMember('categoryId', function (opts) { return opts.sourceObject.attributes["Category"]; })
            .forMember('createdBy', function (opts) { return null; })
            .forMember('createdDate', function (opts) { return null; })
            .forMember('modifiedBy', function (opts) { return null; })
            .forMember('modifiedDate', function (opts) { return null; })     
            .ignoreAllNonExisting();

        //investigation feature to INV entitydto
        automapperUtil.createMap('graphic','INV')
            .forMember('id', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('entTypeId', function (opts) { return 'INV'; })
            .forMember('cSID', function (opts) { return null; })
            .forMember('shape', lang.hitch(this, function (opts) { return this._getWKT(opts.sourceObject.geometry); }))
            .forMember('xMin', function (opts) { return opts.sourceObject._extent.xmin; })
            .forMember('xMax', function (opts) { return opts.sourceObject._extent.xmax; })
            .forMember('yMin', function (opts) { return opts.sourceObject._extent.ymin; })
            .forMember('yMax', function (opts) { return opts.sourceObject._extent.ymax; })
            .forMember('reportTitle', function (opts) { return null; })
            .forMember('reportDate', function (opts) { return null; })
            .forMember('receivedDate', function (opts) { return null; })
            .forMember('auditedBy', function (opts) { return null; })
            .forMember('auditedDate', function (opts) { return null; })
            .forMember('reviewedBy', function (opts) { return null; })
            .forMember('reviewedDate', function (opts) { return null; })
            .forMember('reportFromId', function (opts) { return null; })
            .forMember('proposedChangeId', function (opts) { return null; })
            .forMember('investigationPriorityId', function (opts) { return null; })
            .forMember('fileNo', function (opts) { return null; })
            .forMember('investigationTypeId', function (opts) { return opts.sourceObject.attributes["InvestigationType"]; })
            .forMember('documentNo', function (opts) { return null; })
            .forMember('preparedFor', function (opts) { return null; })
            .forMember('createdBy', function (opts) { return null; })
            .forMember('createdDate', function (opts) { return null; })
            .forMember('modifiedBy', function (opts) { return null; })
            .forMember('modifiedDate', function (opts) { return null; })             
            .ignoreAllNonExisting();

        //site feature to ENQ entitydto
        automapperUtil.createMap('graphic','ENQ')
            .forMember('id', function (opts) { return opts.sourceObject.attributes["ID"]; })
            .forMember('entTypeId', function (opts) { return 'ENQ'; })
            .forMember('cSID', function (opts) { return null; })
            .forMember('shape', lang.hitch(this, function (opts) { return this._getWKT(opts.sourceObject.geometry); }))
            .forMember('xMin', function (opts) { return opts.sourceObject._extent.xmin; })
            .forMember('xMax', function (opts) { return opts.sourceObject._extent.xmax; })
            .forMember('yMin', function (opts) { return opts.sourceObject._extent.ymin; })
            .forMember('yMax', function (opts) { return opts.sourceObject._extent.ymax; })
            .forMember('enquirerName', function (opts) { return opts.sourceObject.attributes["EnquirerName"]; })
            .forMember('natureOfEnquiry', function (opts) { 
                var natureText = '';

                //add in sitename no reference is populated
                if (opts.sourceObject.attributes["SiteName"] && opts.sourceObject.attributes["SiteName"] !== '') {
                    natureText += 'Site Name: ' + opts.sourceObject.attributes["SiteName"] + '\n';
                }

                //add in consent no reference is populated
                if (opts.sourceObject.attributes["ConsentNo"] && opts.sourceObject.attributes["ConsentNo"] !== '') {
                    natureText += 'Consent No: ' + opts.sourceObject.attributes["ConsentNo"] + '\n';
                }

                //add in due date as string 
                if (opts.sourceObject.attributes["DueDate"] && opts.sourceObject.attributes["DueDate"]) {
                    var dueDate = new Date( opts.sourceObject.attributes["DueDate"] *1000);
                    natureText += 'Due Date: ' + dueDate.toLocaleString() + '\n';
                }

                //add in the nature of enquirey text added to form
                if (opts.sourceObject.attributes["NatureOfEnquiry"] && opts.sourceObject.attributes["NatureOfEnquiry"] !== '') {
                    natureText += opts.sourceObject.attributes["NatureOfEnquiry"];
                }
                return natureText; })
            .forMember('contactId', function (opts) { return null; })
            .forMember('enquiryTypeId', function (opts) { return opts.sourceObject.attributes["EnquiryType"]; })
            .forMember('contact', function (opts) { 
                var contact = {};

                return null; })
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

    //return record template with the given parameter
    _getRecordTemplate: function (id) {
        var recordTemplates = arrayUtils.filter(this.recordTemplateLayers, function (item) { return item.layerUrl === id || item.apiSettings.mappingClass === id; });
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
    },

    //return the specific extent property of the provided geometry
    _getExtentProperty: function (geometry, property) {
        if (!geometry) return null;

        var extent = null;
        switch (geometry.type) {

            case 'point':
                extent = new Extent(geometry.x, geometry.y, geometry.x, geometry.y, geometry.spatialReference);
                break;

            case 'multipoint':
            case 'polyline':
            case 'polygon':
                extent = geometry.getExtent();
                break;

            case 'extent':
                extent = geometry
                break;

            default:
                // do nothing
                break;
        }

        if (extent) {
            return extent['property'];
        } else {
            return null;
        }
    }
  });

});
