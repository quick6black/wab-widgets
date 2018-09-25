define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/on", "dojo/Deferred", "dojo/dom-class", "dojo/dom-construct", 'dojo/dom-style', "dijit/Viewport", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/form/DropDownButton", "dijit/DropDownMenu", "dijit/MenuItem", "dojo/text!./templates/CreateFeaturePane.html", "dojo/i18n!../nls/strings", "jimu/dijit/Message", "jimu/dijit/CheckBox", "esri/graphic", "esri/layers/GraphicsLayer", "esri/layers/FeatureLayer", "esri/dijit/editing/TemplatePicker", "esri/dijit/AttributeInspector", "esri/tasks/query", "esri/tasks/QueryTask", "esri/toolbars/draw", './layerButton', "./LEDrawingOptions"], function (declare, lang, arrayUtils, on, Deferred, domClass, domConstruct, domStyle, Viewport, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, DropDownButton, DropDownMenu, MenuItem, template, i18n, Message, Checkbox, Graphic, GraphicsLayer, FeatureLayer, TemplatePicker, AttributeInspector, Query, QueryTask, Draw, layerButton, LEDrawingOptions) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,
    wabWidget: null,
    map: null,

    templatePicker: null,
    drawToolbar: null,
    drawingToolMenus: null,
    drawingTool: null,
    currentDrawType: null,

    recordTemplateLayers: null,

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

      //create the layer buttons 
      this._createLayerButtons();
    },

    resize: function resize() {},

    /*---------------------------------------------------------
     	  UI AND SETUP DUNCTIONS */

    //enable and setip the geometry editing
    _setupEditTools: function _setupEditTools() {
      // Enable toolbar components
      this.drawToolbar = new Draw(this.map);

      // draw event
      this.own(on(this.drawToolbar, "draw-complete", lang.hitch(this, function (evt) {
        //Reenable ma click events
        this.wabWidget._mapClickHandler(false);

        if (this._drawToolEditMode) {} else {
          if (this.templatePicker !== undefined && this.templatePicker !== null && this.templatePicker.getSelected() === null) {
            // In select mode - use as select geometry
            //this._processOnMapClick(evt);
            console.log('LLUREditor::_setupEditTools::draw-complete No Template');
          } else {
            // In create feature mode - process to layers
            var selectedTemplate = this.templatePicker.getSelected();
            this.wabWidget._prepareRecord(evt.geometry, null, selectedTemplate);
          }
        }
      })));
    },

    //update layer option buttons from configured layers
    _createLayerButtons: function _createLayerButtons() {
      if (this.recordTemplateLayers === null) {
        this.wabWidget._getConfigTemplates();
        this.recordTemplateLayers = this.wabWidget.recordTemplateLayers;
      }

      if (this.recordTemplateLayers.length > 1) {
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
      } else {
        this._createTemplatePicker(this.recordTemplateLayers[0]);
      }
      this.resize();
    },

    //create the template picker showing the templates for the selected layer type
    _createTemplatePicker: function _createTemplatePicker(item) {
      if (this.drawingTool) {
        this.drawingTool.destroy();
      }

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

      //create draw optons tool
      var drawingOptionsToolDiv = domConstruct.create("div");
      domConstruct.place(drawingOptionsToolDiv, this.drawingOptionsDiv, "last");

      if (this.drawingToolMenus === null) {
        this.drawingToolMenus = this._createDrawingMenus();
      }

      this.drawingTool = new DropDownButton({
        label: "",
        name: "drawingTool",
        id: "drawingTool"
      }, drawingOptionsToolDiv);
      this.drawingTool.startup();
      this._setDrawingToolbar("select", null);
    },

    _createDrawingMenus: function _createDrawingMenus() {
      var menus = {};
      for (var property in LEDrawingOptions) {
        menus[property] = this._createDrawingMenu(LEDrawingOptions[property]);
      }
      return menus;
    },

    _createDrawingMenu: function _createDrawingMenu(drawingOption) {
      var menu = new DropDownMenu({ style: "display: none;" });
      arrayUtils.forEach(drawingOption, function (options) {
        options = lang.mixin(options, {
          onClick: lang.hitch(this, this._drawingToolClick(drawingOption, options))
        });
        var menuItem = new MenuItem(options);
        menu.addChild(menuItem);
      }, this);
      menu.startup();
      return menu;
    },

    /*---------------------------------------------------------
      EDIT TOOLS AND FUNCTIONS */

    //activate the toolbar
    _activateTemplateToolbar: function _activateTemplateToolbar(template) {
      var draw_type = null;
      var shape_type = null;
      var selectedTemplate = template;

      if (!selectedTemplate && this.templatePicker) {
        selectedTemplate = this.templatePicker.getSelected();
      }

      if (selectedTemplate && selectedTemplate !== null) {
        shape_type = selectedTemplate.featureLayer.geometryType;

        if (selectedTemplate.template !== undefined && selectedTemplate.template !== null && selectedTemplate.template.drawingTool !== undefined && selectedTemplate.template.drawingTool !== null) {

          switch (selectedTemplate.template.drawingTool) {
            case "esriFeatureEditToolNone":
              switch (selectedTemplate.featureLayer.geometryType) {
                case "esriGeometryPoint":
                  draw_type = draw_type !== null ? draw_type : Draw.POINT;
                  break;
                case "esriGeometryPolyline":
                  draw_type = draw_type !== null ? draw_type : Draw.POLYLINE;
                  break;
                case "esriGeometryPolygon":
                  draw_type = draw_type !== null ? draw_type : Draw.POLYGON;
                  break;
              }
              break;
            case "esriFeatureEditToolPoint":
              draw_type = draw_type !== null ? draw_type : Draw.POINT;
              break;
            case "esriFeatureEditToolLine":
              draw_type = draw_type !== null ? draw_type : Draw.POLYLINE;
              break;
            case "esriFeatureEditToolAutoCompletePolygon":
            case "esriFeatureEditToolPolygon":
              draw_type = draw_type !== null ? draw_type : Draw.POLYGON;
              break;
            case "esriFeatureEditToolCircle":
              draw_type = draw_type !== null ? draw_type : Draw.CIRCLE;
              break;
            case "esriFeatureEditToolEllipse":
              draw_type = draw_type !== null ? draw_type : Draw.ELLIPSE;
              break;
            case "esriFeatureEditToolRectangle":
              draw_type = draw_type !== null ? draw_type : Draw.RECTANGLE;
              break;
            case "esriFeatureEditToolFreehand":
              switch (selectedTemplate.featureLayer.geometryType) {
                case "esriGeometryPoint":
                  draw_type = draw_type !== null ? draw_type : Draw.POINT;
                  break;
                case "esriGeometryPolyline":
                  draw_type = draw_type !== null ? draw_type : Draw.FREEHAND_POLYLINE;
                  break;
                case "esriGeometryPolygon":
                  draw_type = draw_type !== null ? draw_type : Draw.FREEHAND_POLYGON;
                  break;
              }
              break;
            default:
              switch (selectedTemplate.featureLayer.geometryType) {
                case "esriGeometryPoint":
                  draw_type = draw_type !== null ? draw_type : Draw.POINT;
                  break;
                case "esriGeometryPolyline":
                  draw_type = draw_type !== null ? draw_type : Draw.POLYLINE;
                  break;
                case "esriGeometryPolygon":
                  draw_type = draw_type !== null ? draw_type : Draw.POLYGON;
                  break;
              }
              break;
          }
        } else {
          switch (selectedTemplate.featureLayer.geometryType) {
            case "esriGeometryPoint":
              draw_type = draw_type !== null ? draw_type : Draw.POINT;
              break;
            case "esriGeometryPolyline":
              draw_type = draw_type !== null ? draw_type : Draw.POLYLINE;
              break;
            case "esriGeometryPolygon":
              draw_type = draw_type !== null ? draw_type : Draw.POLYGON;
              break;
          }
        }
      }

      this.drawToolbar.activate(draw_type);
      this._setDrawingToolbar(shape_type, draw_type);
    },

    _drawingToolClick: function _drawingToolClick(shapeType, options) {
      return function () {
        if (shapeType !== "select") {

          if (options.label.indexOf(window.apiNls.widgets.editor.tools.NLS_selectionNewLbl) >= 0) {
            this.wabWidget._mapClickHandler(false);
            this.map.setInfoWindowOnClick(false);
          }

          this.drawingTool.set('label', options.label);
          this.drawingTool.set('iconClass', options.iconClass);
          this.drawToolbar.activate(options._drawType);
          this.currentDrawType = options._drawType;
          this.currentShapeType = shapeType;
        }
      };
    },

    _setDrawingToolbar: function _setDrawingToolbar(shapeType, drawType) {
      if (this.drawingTool === null || this.drawingTool === undefined) {
        return;
      }

      if (this.currentShapeType === null || this.currentShapeType === undefined || this.currentShapeType !== shapeType) {
        this.drawingTool.set('dropDown', this.drawingToolMenus[shapeType]);
      }

      this.currentShapeType = shapeType;

      this.currentDrawType = null;

      arrayUtils.some(LEDrawingOptions[shapeType], function (options) {
        if (options._drawType === drawType || drawType === null) {
          this.drawingTool.set('label', options.label);
          this.drawingTool.set('iconClass', options.iconClass);
          this.currentDrawType = options._drawType;
          return true;
        } else {
          return false;
        }
      }, this);

      //if the proper type was not found, set to first
      if (this.currentDrawType === null || this.currentDrawType === undefined) {
        this.drawingTool.set('label', LEDrawingOptions[shapeType][0].label);
        this.drawingTool.set('iconClass', LEDrawingOptions[shapeType][0].iconClass);
        this.currentDrawType = LEDrawingOptions[shapeType][0]._drawType;
      }
    }

  });
});
