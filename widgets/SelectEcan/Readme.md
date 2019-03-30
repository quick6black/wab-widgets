#Changes from Existing Select Widget

*Based off ESRI Select Widget from WAB Developer Edition v2.9*  



### Changes

**5 Aug 2018** 


- Ported to WAB 2.9 framework
- Removal of custom layer selection state toggle code which is replaced with functions now standard in ESRI version of widget.
- Default selection state checkbox values can be overriden with config setting to make all either checked on (i.e. as though layer is visible), checked off (layer not visible).  If config value is not supplied, uses standard functionality.
- Change to make option to activate the select dijit a configurable option so that admin can determine if the widget auto starts when opened/activated.
- Settings page updated to include options for the new config settings.     


**23 May 2017**     


- The base class has been renamed to jimu-widget-select-ecan.  
- Addition of following functions to **Widget.js** in section marked ECAN ADDITIONS:  
    -  **selectByFeature** function which expects a featureset.  Called by custom feature action and determines the number of features supplied.  If 0 features, not further action taken.  If one feature, passes the graphic to _simulateDrawAction function.  If more than 1 feature, combines geometry and sends the combined shape to the _simulate DrawAction.
    -  **\_simulateDrawAction** function emits a drawEnd on the select dijit's drawbox passing the supplied graphic as though the drawbox had generated the graphic.  This triggers the select action in the widget.
    -  **\_pointToPolygon** function which creates a square polygon around the supplied point of x metres (default value 1m).
- Addition of following references in DEFINE block of to **Widget.js** :
	- *esri/Graphic*
	- *esri/geometry/geometryEngine*
	- *esri/geometry/Polygon*
- Addition of **SelectByGeometryFeatureAction.js** file to root of widget.  This is the base action class for the select by geometry feature action used in the feature action framework of the WAB.
- Addition to the **manifest.json** file of the SelectbyGeometry details to the feature actions object array.  This registers the feature action with the WAB framework for this widget.
- Addition of **selectbygeometry\_default.png** and **selectbygeometry\_hover.png** file to images folder of the widget folder.
- Addition of **\_featureAction_SelectByGeometry** entry to the **strings.js** file for the display name to appear on the Select By Geometry feature action.
  
**21 Nov 2018** 


- Merged in changes from WAB 2.10 version of Select widget
