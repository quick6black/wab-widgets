///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
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

// jscs:disable validateIndentation

define(["esri/toolbars/draw"], function (Draw) {

  var LEDrawingOptions = {
    select: [{
      id: "leNewSelection",
      iconClass: "leToolbarIcon leNewSelectionIcon",
      label: window.apiNls.widgets.editor.tools.NLS_selectionNewLbl + ' ' + window.apiNls.widgets.editor.tools.NLS_pointLbl
    }, {
      id: "leNewSelectionRect",
      iconClass: "leToolbarIcon leRectangleIcon",
      _drawType: Draw.RECTANGLE,
      label: window.apiNls.widgets.editor.tools.NLS_selectionNewLbl + ' ' + window.apiNls.widgets.editor.tools.NLS_rectangleLbl
    }, {
      id: "leNewSelectionPolygon",
      iconClass: "leToolbarIcon lePolygonIcon",
      _drawType: Draw.POLYGON,
      label: window.apiNls.widgets.editor.tools.NLS_selectionNewLbl + ' ' + window.apiNls.widgets.editor.tools.NLS_polygonLbl
    }, {
      id: "leNewSelectionPolyline",
      iconClass: "leToolbarIcon lePolylineIcon",
      _drawType: Draw.POLYLINE,
      label: window.apiNls.widgets.editor.tools.NLS_selectionNewLbl + ' ' + window.apiNls.widgets.editor.tools.NLS_polylineLbl
    }],
    esriGeometryPoint: [{
      id: "lePointTool",
      iconClass: "leToolbarIcon lePointIcon",
      _disabledIcon: "leToolbarIcon lePointIconDisabled",
      _drawType: Draw.POINT,
      label: window.apiNls.widgets.editor.tools.NLS_pointLbl
    }],
    esriGeometryPolyline: [{
      id: "leDrawPolyline",
      iconClass: "leToolbarIcon lePolylineIcon",
      _disabledIcon: "leToolbarIcon lePolylineIconDisabled",
      _drawType: Draw.POLYLINE,
      label: window.apiNls.widgets.editor.tools.NLS_polylineLbl
    }, {
      id: "leDrawFreehandPolyline",
      iconClass: "leToolbarIcon leFreehandPolylineIcon",
      _disabledIcon: "seToolbarIcon leFreehandPolylineIcon",
      _drawType: Draw.FREEHAND_POLYLINE,
      label: window.apiNls.widgets.editor.tools.NLS_freehandPolylineLbl
    }, {
      id: "leDrawRectPolyline",
      iconClass: "leToolbarIcon leRectangleIcon",
      _disabledIcon: "leToolbarIcon leRectangleIcon",
      _drawType: Draw.RECTANGLE,
      label: window.apiNls.widgets.editor.tools.NLS_rectangleLbl
    }, {
      id: "leDrawArrowPolyline",
      iconClass: "leToolbarIcon leArrowIcon",
      _disabledIcon: "leToolbarIcon leArrowIcon",
      _drawType: Draw.ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowLbl
    }, {
      id: "leDrawArrowUpPolyline",
      iconClass: "leToolbarIcon leArrowUpIcon",
      _disabledIcon: "leToolbarIcon leArrowUpIcon",
      _drawType: Draw.UP_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowUpLbl
    }, {
      id: "leDrawDownArrowPolyline",
      iconClass: "leToolbarIcon leArrowDownIcon",
      _disabledIcon: "leToolbarIcon leArrowDownIcon",
      _drawType: Draw.DOWN_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowDownLbl
    }, {
      id: "leDrawLeftArrowPolyline",
      iconClass: "leToolbarIcon leArrowLeftIcon",
      _disabledIcon: "leToolbarIcon arrowLeftIcon",
      _drawType: Draw.LEFT_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowLeftLbl
    }, {
      id: "leDrawRightArrowPolyline",
      iconClass: "leToolbarIcon leArrowIcon",
      _disabledIcon: "leToolbarIcon leArrowIcon",
      _drawType: Draw.RIGHT_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowRightLbl
    }, {
      id: "leDrawCirclePolyline",
      iconClass: "leToolbarIcon leCircleIcon",
      _disabledIcon: "leToolbarIcon leCircleIcon",
      _drawType: Draw.CIRCLE,
      label: window.apiNls.widgets.editor.tools.NLS_circleLbl
    }, {
      id: "leDrawEllipsePolyline",
      iconClass: "leToolbarIcon leEllipseIcon",
      _disabledIcon: "leToolbarIcon leEllipseIcon",
      _drawType: Draw.ELLIPSE,
      label: window.apiNls.widgets.editor.tools.NLS_ellipseLbl
    }, {
      id: "leDrawTrianglePolyline",
      iconClass: "leToolbarIcon leTriangleIcon",
      _disabledIcon: "leToolbarIcon leTriangleIcon",
      _drawType: Draw.TRIANGLE,
      label: window.apiNls.widgets.editor.tools.NLS_triangleLbl
    }],
    esriGeometryPolygon: [{
      id: "leDrawPolygon",
      iconClass: "leToolbarIcon lePolygonIcon",
      _disabledIcon: "leToolbarIcon lePolygonIconDisabled",
      _drawType: Draw.POLYGON,
      label: window.apiNls.widgets.editor.tools.NLS_polygonLbl
    }, {
      id: "leDrawFreehandPolygon",
      iconClass: "leToolbarIcon leFreehandPolygonIcon",
      _disabledIcon: "leToolbarIcon leFreehandPolygonIconDisabled",
      _drawType: Draw.FREEHAND_POLYGON,
      label: window.apiNls.widgets.editor.tools.NLS_freehandPolygonLbl

    }, {
      id: "leDrawRect",
      iconClass: "leToolbarIcon leRectangleIcon",
      _disabledIcon: "leToolbarIcon leRectangleIcon",
      _drawType: Draw.RECTANGLE,
      label: window.apiNls.widgets.editor.tools.NLS_rectangleLbl
    }, {
      id: "leDrawArrow",
      iconClass: "leToolbarIcon leArrowIcon",
      _disabledIcon: "leToolbarIcon leArrowIcon",
      _drawType: Draw.ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowLbl
    }, {
      id: "leDrawArrowUp",
      iconClass: "leToolbarIcon leArrowUpIcon",
      _disabledIcon: "leToolbarIcon leArrowUpIcon",
      _drawType: Draw.UP_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowUpLbl
    }, {
      id: "leDrawDownArrow",
      iconClass: "leToolbarIcon leArrowDownIcon",
      _disabledIcon: "leToolbarIcon leArrowDownIcon",
      _drawType: Draw.DOWN_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowDownLbl
    }, {
      id: "leDrawLeftArrow",
      iconClass: "leToolbarIcon leArrowLeftIcon",
      _disabledIcon: "leToolbarIcon arrowLeftIcon",
      _drawType: Draw.LEFT_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowLeftLbl
    }, {
      id: "leDrawRightArrow",
      iconClass: "leToolbarIcon leArrowIcon",
      _disabledIcon: "leToolbarIcon leArrowIcon",
      _drawType: Draw.RIGHT_ARROW,
      label: window.apiNls.widgets.editor.tools.NLS_arrowRightLbl
    }, {
      id: "leDrawCircle",
      iconClass: "leToolbarIcon leCircleIcon",
      _disabledIcon: "leToolbarIcon leCircleIcon",
      _drawType: Draw.CIRCLE,
      label: window.apiNls.widgets.editor.tools.NLS_circleLbl
    }, {
      id: "leDrawEllipse",
      iconClass: "leToolbarIcon leEllipseIcon",
      _disabledIcon: "leToolbarIcon leEllipseIcon",
      _drawType: Draw.ELLIPSE,
      label: window.apiNls.widgets.editor.tools.NLS_ellipseLbl
    }, {
      id: "leDrawTriangle",
      iconClass: "leToolbarIcon leTriangleIcon",
      _disabledIcon: "leToolbarIcon leTriangleIcon",
      _drawType: Draw.TRIANGLE,
      label: window.apiNls.widgets.editor.tools.NLS_triangleLbl
    }]
  };
  return LEDrawingOptions;
});
