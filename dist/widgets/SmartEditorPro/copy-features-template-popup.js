define(["dojo/_base/declare", "jimu/BaseWidgetSetting", "dijit/_WidgetsInTemplateMixin", "dojo/_base/lang", 'dojo/_base/array', "dojo/text!./copy-features-template-popup.html", "jimu/dijit/Popup", "dojo/dom-construct", 'dojo/dom-style', 'esri/dijit/editing/TemplatePicker', './SEFilterEditor', 'esri/urlUtils'], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, lang, array, CopyFeaturesTemplate, Popup, domConstruct, domStyle, TemplatePicker, SEFilterEditor, esriUrlUtils) {
  // to create a widget, derive it from BaseWidget.
  return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {
    baseClass: 'copy-features-template-popup',
    templateString: CopyFeaturesTemplate,
    popup: null,
    layers: [],
    startup: function startup() {
      this.inherited(arguments);

      if (this.layers && this.layers.length > 0) {

        this.templatePicker = new TemplatePicker({
          featureLayers: this.layers,
          rows: "auto",
          columns: 6,
          grouping: true,
          /*style: "height: auto; overflow: auto;",*/
          'class': 'esriTemplatePicker',
          maxLabelLength: "25",
          showTooltip: false

        }, this.divTemplatePicker);

        this.templatePicker.startup();

        this.templatePicker.on("selection-change", lang.hitch(this, function () {
          var selected = this.templatePicker.getSelected();
          if (selected) {
            var featureLayer = selected.featureLayer;
            var type = selected.type;
            var template = selected.template;
            this.popup.enableButton(0);
          } else {
            this.popup.disableButton(0);
          }
        }));

        this._addFilterEditor(this.layers);
        this._applyURLTemplateFilter();
      }
    },
    postCreate: function postCreate() {
      if (this.layers && this.layers.length > 0) {
        //create popup for bufferSettings
        this._createCopyFeaturesPopup();
        this._initMultipleFeaturesContent();
      } else {
        alert('There are currently no editable layers that can be used with this tool.');
      }
    },

    _initMultipleFeaturesContent: function _initMultipleFeaturesContent() {
      if (this.featureSet && this.featureSet.features.length > 1) {
        domStyle.set(this.multipleFeaturesContent, 'display', 'block');
      }
    },

    /**
    * create popup to display layer chooser
    * @memberOf widgets/SmartEditorEcan/components/copyFeaturesPopup
    **/
    _createCopyFeaturesPopup: function _createCopyFeaturesPopup() {
      //creating ok button
      this.okButton = domConstruct.create("button", {
        title: this.nls.copyFeaturesPopup.ok
      });
      this.okButton.label = this.nls.copyFeaturesPopup.ok;
      this.okButton.onClick = lang.hitch(this, function () {
        this.onOkClick();
      });
      //creating cancel button
      this.cancelButton = domConstruct.create("button", {
        title: this.nls.copyFeaturesPopup.cancel
      });
      this.cancelButton.label = this.nls.copyFeaturesPopup.cancel;
      //initializing popup with default configuration
      this.popup = new Popup({
        titleLabel: this.nls.copyFeaturesPopup.titleLabel,
        content: this.copyFeaturesContainer,
        width: 500,
        autoHeight: true,
        buttons: [this.okButton, this.cancelButton]
      });
      //Setting default state of ok button as disabled
      this.popup.disableButton(0);
    },

    _addFilterEditor: function _addFilterEditor(layers) {
      if (this.config.editor.useFilterEditor === true && this.templatePicker) {
        if (this._filterEditor) {
          this._filterEditor.setTemplatePicker(this.templatePicker, layers);
        } else {
          this._filterEditorNode = domConstruct.create("div", {});
          this.divTemplatePicker.insertBefore(this._filterEditorNode, this.divTemplatePicker.firstChild);
          this._filterEditor = new SEFilterEditor({
            _templatePicker: this.templatePicker,
            _layers: layers,
            map: this.map,
            nls: this.nls
          }, this._filterEditorNode);
        }
      }
    },

    _applyURLTemplateFilter: function _applyURLTemplateFilter() {
      var loc = window.location;
      var urlObject = esriUrlUtils.urlToObject(loc.href);

      // Check for filter
      if (urlObject.query !== null) {
        var templatesQuery = urlObject.query["templates"] || urlObject.query["TEMPLATES"];
        if (templatesQuery) {
          var templateIDs = this._getTemplateParams(templatesQuery);
          this._filterEditor.filterTextBox.value = templateIDs;
          this._filterEditor._onTemplateFilterChanged();
        }
      }
    },

    _getTemplateParams: function _getTemplateParams(query) {
      var templatesString = '';
      var filterParams = query.split(',');
      if (filterParams.length > 0) {
        // Check layer templates for domain codes that match template urls
        var layers = this.layers;
        var tmps = [],
            tmpIds = [];
        array.forEach(layers, lang.hitch(this, function (layer) {
          if (layer.types && layer.types.length > 0) {
            var dmVals = layer.types.map(function (item) {
              return {
                "id": item["id"],
                "label": item.templates[0]["name"]
              };
            });

            for (var i = 0, l = dmVals.length; i < l; i++) {
              if (tmpIds.indexOf(dmVals[i].label) === -1) {
                tmps.push(dmVals[i]);
                tmpIds.push(dmVals[i].label);
              } else if (tmpIds.indexOf(dmVals[i].id) === -1) {
                tmps.push(dmVals[i]);
                tmpIds.push(dmVals[i].id);
              }
            }
          } else {
            for (var i = 0, l = layer.templates.length; i < l; i++) {
              if (tmpIds.indexOf(layer.templates[i].name) === -1) {
                tmps.push({
                  "id": layer.templates[i].name,
                  "label": layer.templates[i].name
                });
                tmpIds.push(layer.templates[i].name);
              }
            }
          }
        }));

        var templates = [];
        array.forEach(filterParams, function (param) {
          var paramlc = param.toLowerCase();
          var options = tmps.filter(function (item, index) {
            return item.id.toLowerCase() === paramlc || item.label.toLowerCase() === paramlc;
          });

          array.forEach(options, function (item) {
            if (templates.indexOf(item.label) === -1) {
              templates.push(item.label);
            }
          });
        });
        templatesString = templates.join(',');
      }

      return templatesString;
    },

    getSelectedTemplate: function getSelectedTemplate() {
      if (this.templatePicker) {
        return this.templatePicker.getSelected();
      } else return null;
    },

    onOkClick: function onOkClick(evt) {
      return evt;
    },

    onClose: function onClose(evt) {
      return evt;
    },

    destroy: function destroy() {
      this.inherited(arguments);

      if (this.templatePicker) {
        this.templatePicker.destroy();
        this.templatePicker = null;
      }
    }
  });
});
