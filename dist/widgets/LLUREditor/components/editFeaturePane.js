define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/on", "dojo/Deferred", 'dojo/query', "dojo/dom-class", "dojo/dom-construct", 'dojo/dom-style', "dijit/Viewport", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/text!./templates/EditFeaturePane.html", "dojo/i18n!../nls/strings", "dijit/form/Button", "esri/toolbars/edit", "esri/dijit/AttributeInspector", './../libs/automapper'], function (declare, lang, arrayUtils, on, Deferred, dojoQuery, domClass, domConstruct, domStyle, Viewport, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n, Button, Edit, AttributeInspector, automapperUtil) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        i18n: i18n,
        templateString: template,
        wabWidget: null,
        map: null,

        currentUpdateFeature: null,
        currentTargetTemplate: null,

        editToolbar: null,
        attributeInspector: null,

        _editMode: "create",
        _active: false,
        _editToolActive: false,
        geometryChanged: false,

        postCreate: function postCreate() {
            this.inherited(arguments);
            this.own(Viewport.on("resize", this.resize()));
            this.map = this.wabWidget.map;
        },

        destroy: function destroy() {
            this.inherited(arguments);
            //console.warn("AddFromFilePane::destroy");
        },

        startup: function startup() {
            if (this._started) {
                return;
            }

            this.inherited(arguments);

            var self = this;
            var v,
                config = this.wabWidget.config;

            //setup the eidt tools
            this._setupEditTools();
        },

        resize: function resize() {},

        setEditFeature: function setEditFeature(recordTemplate, editMode) {
            if (editMode) {
                this.editMode = editMode;
            } else {
                this.editMode = "create";
            }

            this._updateUI();

            if (recordTemplate) {
                //check if layer loaded
                if (recordTemplate.displayLayer.loaded) {
                    this._refreshAttributeEditor(recordTemplate);
                } else {
                    var cacheLayerHandler = on(recordTemplate.displayLayer, "load", lang.hitch(this, function () {
                        cacheLayerHandler.remove();
                        this._refreshAttributeEditor(recordTemplate);
                    }));
                    return;
                }
            } else {
                alert('no template');
            }
        },

        /*---------------------------------------------------------
          UI AND SETUP FUNCTIONS */

        //update the application ui to reflect the current edit mode - create or update
        _updateUI: function _updateUI() {
            if (this.editMode == "update") {
                this._setNodeHTML(this.instructionsDiv, this.i18n.edit.instructionUpdate);
            } else {
                this._setNodeHTML(this.instructionsDiv, this.i18n.edit.instructionCreate);
            }
        },

        //update the attribute editor field visibility 
        _updateAttributeEditorFields: function _updateAttributeEditorFields() {
            if (this.attributeInspector) {
                //get the field infos of the only layer in the application
                var infos = this.attributeInspector.layerInfos[0].fieldInfos;

                var atiNodes = dojoQuery(".atiLabel");

                arrayUtils.forEach(atiNodes, lang.hitch(this, function (atiNode) {
                    var fieldIDAttr = atiNode.attributes["data-fieldname"];
                    if (fieldIDAttr && fieldIDAttr.value) {
                        var fieldName = fieldIDAttr.value;

                        arrayUtils.forEach(infos, lang.hitch(this, function (info) {
                            if (info.fieldName === fieldName && !info.visible) {
                                //get row
                                var row = info.dijit.domNode.parentNode.parentNode;

                                //hide row
                                domStyle.set(row, "display", "none");
                            }
                        }));
                    }
                }));
            }
        },

        //enable and setip the geometry editing
        _setupEditTools: function _setupEditTools() {
            this.editToolbar = new Edit(this.map);

            // edit events
            this.own(on(this.editToolbar, "graphic-move-stop, rotate-stop, scale-stop, vertex-move-stop, vertex-click", lang.hitch(this, this._geometryEdited)));
        },

        _refreshAttributeEditor: function _refreshAttributeEditor(recordTemplate) {
            //check if inspector is focussed on current edit layer
            if (this.attributeInspector !== null && this.currentTargetTemplate !== recordTemplate) {

                //clear attached components and events
                if (this.atttributeInspectorDelete) {
                    this.atttributeInspectorDelete.remove();
                }

                if (this.cancelButton) {
                    this.cancelButton.destroy();
                }

                if (this.editGeometryButton) {
                    this.editGeometryButton.destroy();
                }

                //remove current inspector
                this.attributeInspector.destroy();
            }

            if (this.attributeInspector === null) {
                this.currentTargetTemplate = recordTemplate;

                //prepare attribute inspector
                //var fieldInfos = lang.clone(recordTemplate.fieldInfos);
                var fieldInfos = this._mapFields(recordTemplate.fieldInfos, this.editMode === "update");
                var layerInfos = [{
                    'featureLayer': recordTemplate.displayLayer,
                    'showAttachments': false,
                    'isEditable': true,
                    'showDeleteButton': false,
                    'fieldInfos': fieldInfos
                }];

                // if (this.editMode === "update") {
                //     arrayUtils.forEach(layerInfos[0]["fieldInfos"], lang.hitch(this, 
                //         function (fieldInfo) {
                //             fieldInfo.visible = fieldInfo.editModeVisible;
                //             fieldInfo.isEditable = fieldInfo.editModeIsEditable;
                //         })
                //     );
                // }

                //create a new attribute inspector
                this.attributeInspectorDiv = domConstruct.create("div");
                domConstruct.place(this.attributeInspectorDiv, this.layerDetailsDiv, "after");
                this.attributeInspector = new AttributeInspector({
                    layerInfos: layerInfos
                }, this.attributeInspectorDiv);
                //add handler to update the feature attributes when the ui is updated.
                this.attributeInspector.on("attribute-change", lang.hitch(this, function (evt) {
                    var feature = evt.feature;
                    feature.attributes[evt.fieldName] = evt.fieldValue;
                    feature.getLayer().applyEdits(null, [feature], null);
                }));

                // this.atttributeInspectorDelete = this.attributeInspector.on("delete", lang.hitch(this, function (evt) {
                //     alert(this.currentTargetTemplate.title + ' - Delete Clicked');
                // }));

                //add in edit geometry button
                this.editGeometryButton = new Button({
                    label: this.i18n.edit.editGeometryLabel,
                    title: this.i18n.edit.editGeometryTooltip,
                    class: "atiButton atiEditGeometryButton"
                });
                this.attributeInspector.editButtons.insertBefore(this.editGeometryButton.domNode, this.attributeInspector.editButtons.childNodes[0]);
                this.editGeometryButton.startup();
                this.editGeometryButton.on("click", lang.hitch(this, function (evt) {
                    this._startEditTool();
                }));

                //add in request statement 
                this.requestButton = new Button({
                    label: this.i18n.edit.requestStatementLabel,
                    title: this.i18n.edit.requestStatementTooltip,
                    class: "atiButton atiRequestButton"
                });
                this.attributeInspector.editButtons.appendChild(this.requestButton.domNode);
                this.requestButton.startup();
                this.requestButton.on("click", lang.hitch(this, function (evt) {
                    var c = confirm(this.i18n.edit.requestStatementConfirm);
                    if (c) {
                        this.wabWidget.requestStatement();
                    }
                }));

                //add in submit 
                this.submitButton = new Button({
                    label: this.i18n.edit.submitLabel,
                    title: this.i18n.edit.submitTooltip,
                    class: "atiButton atiSubmitButton"
                });
                this.attributeInspector.editButtons.appendChild(this.submitButton.domNode);
                this.submitButton.startup();
                this.submitButton.on("click", lang.hitch(this, function (evt) {
                    var c = confirm(this.i18n.edit.submitConfirm);
                    if (c) {
                        var rec = this.attributeInspector._selection[0];

                        //determine record type
                        var recordType = this.currentTargetTemplate.apiSettings.mappingClass;
                        var saveRec = automapperUtil.map('graphic', recordType, rec);

                        //calll the widget
                        this.wabWidget.saveChanges(rec, saveRec);
                    }
                }));

                //add in cancel
                this.cancelButton = new Button({
                    label: this.i18n.edit.cancelLabel,
                    title: this.i18n.edit.cancelTooltip,
                    class: "atiButton atiCancelButton"
                });
                this.attributeInspector.editButtons.appendChild(this.cancelButton.domNode);
                this.cancelButton.startup();
                this.cancelButton.on("click", lang.hitch(this, function (evt) {
                    var c = confirm(this.i18n.edit.cancelConfirm);
                    if (c) {
                        this.wabWidget.cancelChanges();
                    }
                }));
            }

            this.attributeInspector.refresh();
            this._updateAttributeEditorFields();
        },

        /*---------------------------------------------------------
          EDIT TOOLS AND FUNCTIONS */

        //start geometry edit tool
        _startEditTool: function _startEditTool() {
            if (!this._editToolActive) {
                //disable info window
                this.map.setInfoWindowOnClick(false);

                //hide info window if showing
                if (this.map.infoWindow.isShowing) {
                    this.map.infoWindow.hide();
                }

                this._activateEditToolbar(this.wabWidget.currentFeature);
                this._editToolActive = true;
            } else {
                //disable info window
                this.map.setInfoWindowOnClick(true);
                if (this.editToolbar.getCurrentState().tool !== 0) {
                    this.editToolbar.deactivate();
                }
                this._editToolActive = false;
            }
        },

        _activateEditToolbar: function _activateEditToolbar(feature) {
            var layer = feature.getLayer();
            if (this.editToolbar.getCurrentState().tool !== 0) {
                this.editToolbar.deactivate();
            }
            switch (layer.geometryType) {
                case "esriGeometryPoint":
                    this.editToolbar.activate(Edit.MOVE, feature);
                    break;
                case "esriGeometryPolyline":
                case "esriGeometryPolygon":
                    /*jslint bitwise: true*/
                    this.editToolbar.activate(Edit.EDIT_VERTICES | Edit.MOVE | Edit.ROTATE | Edit.SCALE, feature);
                    /*jslint bitwise: false*/
                    break;
            }
        },

        //handle edit toolbar complete action  
        _geometryEdited: function _geometryEdited() {
            this.geometryChanged = true;
            //this._enableAttrInspectorSaveButton(this._validateAttributes());
        },

        _validateAttributes: function _validateAttributes(changeDefaultState) {
            /*
            //optional param to determine if no rule is found, should it reset the state.
            //Required for when a form is disabled and a rule to hide a field is required
            changeDefaultState = typeof changeDefaultState !== 'undefined' && changeDefaultState !== null ? changeDefaultState : true;
            var attachmentValidationResult = [];
            var attachmentResult = true;
            var rowsWithGDBRequiredFieldErrors = this._validateRequiredFields();
            var featureHasEdits = this._validateFeatureChanged();
              var rowsWithSmartErrors = [];
            var formValid = true;
            if (this._smartAttributes !== undefined) {
                if (this._smartAttributes !== null) {
                    rowsWithSmartErrors = this._smartAttributes.toggleFields(changeDefaultState);
                }
            }
                      if (this._attributeInspectorTools !== undefined) {
                if (this._attributeInspectorTools !== null) {
                    formValid = this._attributeInspectorTools.formValid();
                }
            }
              if (featureHasEdits && this.currentLayerInfo && this.currentLayerInfo.attachmentValidations) {
                arrayUtils.forEach(this.currentLayerInfo.attachmentValidations.Actions,
                    lang.hitch(this, function (action) {
                        var attachmentObj = {};
                        if (action.filter && this._smartAttributes) {
                            attachmentObj.actionType = action.actionName;
                            attachmentObj.result = this._smartAttributes.processFilter(action.filter);
                            attachmentValidationResult.push(attachmentObj);
                        }
                    })
                );
                  //Perform action based on feature is being created or updated
                if (this.attrInspector._attachmentUploader) {
                    attachmentResult =
                        this.performAction(this.attrInspector._attachmentUploader, attachmentValidationResult, true);
                } else if (this.attrInspector._attachmentEditor) {
                    attachmentResult =
                        this.performAction(this.attrInspector._attachmentEditor, attachmentValidationResult, false);
                }
            }
            return (editUtils.isObjectEmpty(rowsWithGDBRequiredFieldErrors) &&
                rowsWithSmartErrors.length === 0 && formValid && featureHasEdits && attachmentResult);
            */
        },

        /*---------------------------------------------------------
          UTIL FUNCTIONS */
        _mapFields: function _mapFields(originalFieldInfos, editmode) {
            var fieldInfos = [];
            var mapType = 'field';
            if (editmode) {
                mapType = 'fieldEditMode';
            }

            arrayUtils.forEach(originalFieldInfos, lang.hitch(this, function (fld) {
                fieldInfos.push(automapperUtil.map('fieldConfig', mapType, fld));
            }));

            return fieldInfos;
        },

        _setNodeText: function _setNodeText(nd, text) {
            nd.innerHTML = "";
            if (text) {
                nd.appendChild(document.createTextNode(text));
            }
        },

        _setNodeTitle: function _setNodeTitle(nd, text) {
            nd.title = "";
            if (text) {
                nd.setAttribute("title", text);
            }
        },

        _setNodeHTML: function _setNodeHTML(nd, html) {
            nd.innerHTML = "";
            if (html) {
                nd.innerHTML = html;
            }
        }

    });
});
