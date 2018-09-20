define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/_base/html', 'dojo/_base/array', 'dojo/on', 'dojo/promise/all', 'dijit/_WidgetsInTemplateMixin', "dojo/i18n", "dojo/dom-construct", 'dojo/dom-style', 'jimu/BaseWidget', 'jimu/WidgetManager', "esri/graphic", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/dijit/editing/TemplatePicker", "esri/dijit/AttributeInspector", "esri/tasks/query", "esri/tasks/QueryTask", "esri/toolbars/draw", "esri/toolbars/edit", 'esri/urlUtils', './components/layerButton'], function (declare, lang, html, arrayUtils, on, all, _WidgetsInTemplateMixin, i18n, domConstruct, domStyle, BaseWidget, WidgetManager, Graphic, GraphicsLayer, FeatureLayer, TemplatePicker, AttributeInspector, Query, QueryTask, Draw, Edit, esriUrlUtils, layerButton) {
    return declare([BaseWidget, _WidgetsInTemplateMixin], {

        name: 'LLUREditor',
        baseClass: 'llur-editor',
        // this property is set by the framework when widget is loaded.
        // name: 'LLUREditor',
        // add additional properties here

        templatePicker: null,
        editToolbar: null,
        drawToolbar: null,

        displayLayerOnWidgetClose: false,
        displayLayer: null,

        recordTemplateLayers: null,

        currentFeatures: [],

        //methods to communication with app container:
        postMixInProperties: function postMixInProperties() {
            this.inherited(arguments);
            lang.mixin(this.nls, window.jimuNls.common);
        },

        postCreate: function postCreate() {
            this.inherited(arguments);

            //create the layer buttons 
            this._createLayerButtons();

            //check for any url query parameters
            this._checkURLParameters();
        },

        startup: function startup() {
            this.inherited(arguments);

            //initialise the edit tools
            this._setupEditTools();
        },

        onOpen: function onOpen() {
            this._changeDisplayLayerVisibility(true);
            console.log('LLUREditor::onOpen');
        },

        onClose: function onClose() {
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
          EDIT TOOLS AND FUNCTIONS */

        //enable and setip the geometry editing
        _setupEditTools: function _setupEditTools() {
            // Enable toolbar components
            this.editToolbar = new Edit(this.map);
            this.drawToolbar = new Draw(this.map);

            // edit events
            this.own(on(this.editToolbar, "graphic-move-stop, rotate-stop, scale-stop, vertex-move-stop, vertex-click", lang.hitch(this, this._geometryEdited)));

            // draw event
            this.own(on(this.drawToolbar, "draw-complete", lang.hitch(this, function (evt) {
                this.drawToolbar.deactivate();

                if (this._drawToolEditMode) {
                    //this._actionEditTool(evt);
                } else {
                    if (this.templatePicker !== undefined && this.templatePicker !== null && this.templatePicker.getSelected() === null) {
                        // In select mode - use as select geometry
                        //this._processOnMapClick(evt);
                        console.log('LLUREditor::_setupEditTools::draw-complete No Template');
                    } else {
                        // In create feature mode - process to layers
                        var selectedTemplate = this.templatePicker.getSelected();
                        this._prepareRecord(evt.geometry, null, selectedTemplate);
                    }
                }
            })));
        },

        //activate the toolbar
        _activateTemplateToolbar: function _activateTemplateToolbar(template) {
            var draw_type = Draw.POLYGON;

            /*        switch (template.FeatureLayer.geometryType) {
                        case "esriGeometryPoint":
                          draw_type = draw_type !== null ? draw_type : Draw.POINT;
                          break;
                        case "esriGeometryPolyline":
                          draw_type = draw_type !== null ? draw_type : Draw.POLYLINE;
                          break;
                        case "esriGeometryPolygon":
                          draw_type = draw_type !== null ? draw_type : Draw.POLYGON;
                          break;        
            }*/

            this.drawToolbar.activate(draw_type);
            this.map.setInfoWindowOnClick(false);
        },

        //handle edit toolbar complete action  
        _geometryEdited: function _geometryEdited() {
            alert('To Do...');
        },

        //extract settings from URL
        _checkURLParameters: function _checkURLParameters() {
            var loc = window.location;
            var urlObject = esriUrlUtils.urlToObject(loc.href);

            // Check for filter
            if (urlObject.query !== null) {
                var valuesQuery = urlObject.query["llur"];
                if (valuesQuery) {
                    var value = this._getURLParams(valuesQuery);
                    if (value !== null) {
                        //Check for an existing feature with this id
                        this._checkExistingFeature(value);
                    }
                }
            }
        },

        _getURLParams: function _getURLParams(query) {
            var lookupValue = null;
            if (query) {
                //match against configured layer settings
                arrayUtils.forEach(this.recordTemplateLayers, lang.hitch(this, function (recordTemplate) {
                    for (var i = 0, ii = recordTemplate.lookupPatterns.length; i < ii; i++) {
                        var exp = new RegExp(recordTemplate.lookupPatterns[i].pattern);
                        if (exp.test(query)) {
                            var exp2 = new RegExp(recordTemplate.lookupPatterns[i].format);
                            lookupValue = {
                                "lookupValue": query.replace(exp2, ''),
                                "template": recordTemplate
                            };
                            break;
                        }
                    }
                }));
            }
            return lookupValue;
        },

        //make a call to gis service to retrieve an existing feature
        _checkExistingFeature: function _checkExistingFeature(queryItem) {
            if (queryItem && queryItem.lookupValue && queryItem.template) {
                if (!queryItem.queryTask) {
                    queryItem.queryTask = new QueryTask(queryItem.template.lookupUrl);
                }

                var q = new Query();
                q.where = queryItem.template.lookupKeyField + " = " + queryItem.lookupValue;
                q.returnGeometry = true;
                q.outFields = ["*"];
                queryItem.queryTask.execute(q, lang.hitch(this, this._checkExistingFeatureResult), lang.hitch(this, this._requestError));
            }
        },

        //handles result received from existing feature check
        _checkExistingFeatureResult: function _checkExistingFeatureResult(result) {
            if (result && result.features.length > 0) {
                // Get the first shape
                var record = result.features[0];

                //get the record sub type


                // Zoom to shape extent
                this._prepareRecord();
            } else {
                alert('No Record found');
            }
        },

        _requestError: function _requestError(error) {},

        /*---------------------------------------------------------
          RECORD FUNCTIONS */

        _prepareRecord: function _prepareRecord(shape, attributes, template) {
            if (shape) {
                var recordTemplate = null;

                //prepare template if not specified - use template picker current selection
                if (!template) {
                    // Get current selected template
                    template = this.pickerTemplate.getSelected();
                    if (template) {
                        recordTemplate = this._getRecordTemplate(template.featureLayer.url);
                    } else {
                        console.log('LLUREditor::_prepareRecord::No selected template');
                        return;
                    }
                } else {
                    recordTemplate = this._getRecordTemplate(template.featureLayer.url);
                }

                //prepare display layer
                if (!recordTemplate.displayLayer) {
                    recordTemplate.displayLayer = this._cloneLayer(recordTemplate.layer);
                    var cacheLayerHandler = on(recordTemplate.displayLayer, "load", lang.hitch(this, function () {
                        cacheLayerHandler.remove();
                        this._prepareRecord(shape, attributes, template);
                    }));
                    return;
                }

                if (this.displayLayer === null || this.displayLayer !== recordTemplate.displayLayer) {
                    this._removeDisplayLayer();

                    this.displayLayer = recordTemplate.displayLayer;
                    this.map.addLayer(this.displayLayer);
                    this.displayLayer.show();
                }

                var newAttributes = lang.clone(template.template.prototype.attributes);
                var newGraphic = new Graphic(shape, null, newAttributes);

                this.displayLayer.applyEdits([newGraphic], null, null, lang.hitch(this, function (e) {
                    var queryTask = new Query();
                    queryTask.objectIds = [e[0].objectId];
                    this.displayLayer.selectFeatures(queryTask, FeatureLayer.SELECTION_NEW);

                    //this.currentFeature = this.updateFeatures[0] = newGraphic;

                    //this.getConfigDefaults();
                    //this.geometryChanged = false;
                    //if (this._attributeInspectorTools) {
                    //    this._attributeInspectorTools.triggerFormValidation();
                    //}
                    //this._attachLayerHandler();
                    //this.currentLayerInfo = this._getLayerInfoByID(this.currentFeature._layer.id);
                    //this.currentLayerInfo.isCache = true;
                    //this._toggleDeleteButton(false);
                    //this._enableAttrInspectorSaveButton(this._validateAttributes());
                }));

                //this._showTemplate(false, false);

                //if (this.config.editor.hasOwnProperty("autoSaveEdits") && this._autoSaveRuntime === true) {
                //    setTimeout(lang.hitch(this, function () {
                //        var saveBtn = query(".saveButton")[0];
                //        if (!saveBtn) {
                //            //do nothing
                //        } else {
                //            on.emit(saveBtn, 'click', { cancelable: true, bubbles: true });
                //        }
                //    }), 100);
                //}  

                var ext = shape.getExtent();
                this.map.setExtent(ext, true);
            } else {
                console.log('LLUREditor::_prepareRecord::Invalid parameters');
            }
        },

        _removeDisplayLayer: function _removeDisplayLayer() {
            if (this.displayLayer && this.displayLayer !== null) {
                this.displayLayer.clearSelection();
                this.displayLayer.clear();
                this.map.removeLayer(this.displayLayer);
                this.displayLayer = null;
            }
            this.updateFeatures = [];
        },

        /*---------------------------------------------------------
          UI FUNCTIONS */

        //update the display graphics layer visibility status
        _changeDisplayLayerVisibility: function _changeDisplayLayerVisibility(showLayer) {
            if (this.displayLayer) {
                if (showLayer && !this.displayLayer.visible) {
                    this.displayLayer.show();
                }

                if (!showLayer && this.displayLayer.visible && !this.displayLayerOnWidgetClose) {
                    this.displayLayer.hide();
                }
            }
        },

        //update layer option buttons from configured layers
        _createLayerButtons: function _createLayerButtons() {
            if (this.recordTemplateLayers === null) {
                this._getConfigTemplates();
            }

            arrayUtils.forEach(this.recordTemplateLayers, lang.hitch(this, function (recordTemplateLayer) {
                var link = new layerButton({
                    item: recordTemplateLayer
                });
                link.placeAt(this.layerButtonsDiv);
                link.startup();

                link.onClick = lang.hitch(this, function (evt) {
                    var item = link.item;
                    this._createTemplatePicker(item);
                });
            }));
            this.resize();
        },

        //create the template picker showing the templates for the selected layer type
        _createTemplatePicker: function _createTemplatePicker(item) {
            if (this.templateInstructionDiv !== null) {
                domConstruct.destroy(this.templateInstructionDiv);
                this.templateInstructionDiv = null;
            }

            if (this.templatePicker !== null) {
                this._templatePickerSelectionEvent.remove();
                this.templatePicker.destroy();
                this.templatePicker = null;
                this.templatePickerDiv = null;
            }

            // Create the instruction and template picker dom elements
            this.templatePickerDiv = domConstruct.create("div");
            domConstruct.place(this.templatePickerDiv, this.layerButtonsDiv, "after");

            this.templateInstructionDiv = domConstruct.place("<p>Select the type of " + item.title + " to create</p>", this.layerButtonsDiv, "after");
            domConstruct.place(this.templateInstructionDiv, this.layerButtonsDiv, "after");

            // Create the template picker
            var templatePicker = new TemplatePicker({
                featureLayers: [item.layer],
                rows: "auto",
                columns: "5",
                grouping: true,
                style: "height: auto; overflow: auto;"
            }, this.templatePickerDiv);

            templatePicker.startup();

            var selectedTemplate;
            this._templatePickerSelectionEvent = templatePicker.on("selection-change", lang.hitch(this, function () {
                selectedTemplate = templatePicker.getSelected();
                if (selectedTemplate !== null) {
                    // enable draw tool
                    this._activateTemplateToolbar(selectedTemplate);
                } else {
                    //disable tools
                    if (this.drawToolbar) {
                        this.drawToolbar.deactivate();
                    }
                }
            }));

            this.templatePicker = templatePicker;
        },

        /*---------------------------------------------------------
          MAP AND LAYER FUNCTIONS */

        //create a duplicate of the editable layer for local working before sending to service
        _cloneLayer: function _cloneLayer(layer) {
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
        _processLayerFields: function _processLayerFields(fields) {
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

        /*---------------------------------------------------------
          CONFIGURATION */

        //setup the list of layers that the widget has been configured for
        _getConfigTemplates: function _getConfigTemplates() {
            var layers = [];
            arrayUtils.forEach(this.config.recordTemplates, lang.hitch(this, function (recordTemplate) {
                var layer = new FeatureLayer(recordTemplate.layerUrl, {
                    mode: FeatureLayer.MODE_ONDEMAND,
                    outFields: ["*"],
                    id: recordTemplate.title + '_edit',
                    visible: true
                });

                var item = lang.clone(recordTemplate);
                item.layer = layer;
                layers.push(item);
            }));

            this.recordTemplateLayers = layers;
        },

        //return record template withthe given url
        _getRecordTemplate: function _getRecordTemplate(layerUrl) {
            var recordTemplates = arrayUtils.filter(this.recordTemplateLayers, function (item) {
                return item.layerUrl === layerUrl;
            });
            return recordTemplates[0];
        }

    });
});
