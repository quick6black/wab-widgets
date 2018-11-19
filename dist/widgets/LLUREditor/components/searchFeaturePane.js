define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/on", "dojo/Deferred", "dojo/dom-class", "dijit/Viewport", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/text!./templates/SearchFeaturePane.html", "dojo/i18n!../nls/strings", "jimu/dijit/Message", "jimu/dijit/CheckBox"], function (declare, lang, array, on, Deferred, domClass, Viewport, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n, Message, Checkbox) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        i18n: i18n,
        templateString: template,
        wabWidget: null,
        map: null,

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

            //setup ui
            ths._setupUI();
        },

        resize: function resize() {},

        /*---------------------------------------------------------
          UI AND SETUP FUNCTIONS */

        _setupUI: function _setupUI() {},
        _refreshAttributeInspector: function _refreshAttributeInspector(recordTemplate) {
            //check if inspector is focussed on current edit layer
            if (this.attributeInspector !== null && this.currentTargetTemplate !== recordTemplate) {

                //clear attached components and events
                if (this.clearButton) {
                    this.clearButton.destroy();
                }

                if (this.editButton) {
                    this.editButton.destroy();
                }

                //remove current inspector
                this.attributeInspector.destroy();
            }

            if (this.attributeInspector === null) {
                this.currentTargetTemplate = recordTemplate;

                //prepare attribute inspector
                var fieldInfos = this._mapFields(recordTemplate.fieldInfos, this.editMode === "update");
                var layerInfos = [{
                    'featureLayer': recordTemplate.displayLayer,
                    'showAttachments': false,
                    'isEditable': true,
                    'showDeleteButton': false,
                    'fieldInfos': fieldInfos
                }];

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
                        var saveRec = automapperUtil.map('graphic', 'ACT', rec);

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
        }

    });
});
