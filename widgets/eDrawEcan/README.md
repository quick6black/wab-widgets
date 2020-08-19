# eDraw Widget (Ecan Variant)
Enhanced draw widget for Web AppBuilder for ArcGIS.

This is a customised variant of the eDraw widget [https://github.com/magis-nc/esri-webappbuilder-widget-eDraw](https://github.com/magis-nc/esri-webappbuilder-widget-eDraw "https://github.com/magis-nc/esri-webappbuilder-widget-eDraw") developed by MAGIS.
Also see [https://community.esri.com/thread/122331](https://community.esri.com/thread/122331)

## Improvements :
#### Changes made include:  

- Some styling changes (import and export button images)  
- Import functionality will now handle the file type from the advanced draw widget for the Flex Viewer for ArcGIS.  
- The drawing graphics are now separated into point, polyline, polygon and text layers in the same manner as the standard ESRI draw widget, and can be displayed as operational layers.  Consequently the re-order up and down functionality only works within the context of the layer for the specific geometry types.
- There is now capability to save drawings as a Feature Collection to an ArcGIS Portal/ArcGIS Online if user is logged in and has create permissions.  Drawings are saved to a content folder in the user's **My Content** section which is created if it does not exist.  The folder name can be configured in the widget's settings, as can whether this functionality is enabled or not. Saved drawings in portal can also be reloaded into a map.  User can supply a drawing name and brief description for the drawing that maps to the item title and snipped in portal/ArcGIS online.
- UI added to display a list of all saved drawings in portal/ArcGIS online.  Users can manage saved drawings from UI including deleting them.  A placeholder option for and action that can show details and allow user to rename a drawing is in place, thought this functionality is not developed yet.     
- Advanced geometry options for union of polyline or polygon drawings added, as is a function to explode multipart geometry drawings into individual drawings.  Functionality for creating buffer graphics added.
- Custom feature action in widget now allows features in popups or other widgets to be sent to the eDraw widget and converted to drawing objects.
- Users can now change whether they want to load drawings saved in local storage if the widget has been configured to allow it.  This is controlled by a toggle option displayed on the settings tab of the widget in runtime mode.  If the allow local storage mode is disabled in the widget settings, this toggle is hidden. 


## configuration :
- export file name.
- Confirm on delete. A confirm dialog when user delete drawing(s) ?
- add up/down buttons in list ? (N.B. : re-ordering can be done with drag&drop)
- Enable local storage. enable auto-saving in local storage and loading saved drawings on widget load.
    - Local storage key : let empty or set a name :
        - if empty, all apps with eDraw widgets share the same local storage (apps on the same server)
        - if not empty, all apps with the same key share the same local storage (apps on the same server)
- Choose available font families in text plus
- (without UI) set default symbols
- use geometryEngine for measure ?
- specify geometryServer for measure (not used if geometryEngine is activated)
- enable measure by default ? (is measure checkbox checked on polygon/polyline/point add ?)
- measure's labels patterns
        
## Installation :
Add eDrawEcan folder in your Web AppBuilder client\stemapp\widgets folder.

Download Release here:  
[https://github.com/CanterburyRegionalCouncil/wab-widgets/releases/latest](https://github.com/CanterburyRegionalCouncil/wab-widgets/releases/latest)


## Future improvements :
- Add function to be able to convert/export one or more of the current drawings (user selected) to a different file format (intially shapefile or gpx format). Use FME server to handle conversion (widget calls the fme rest api and resurns the results as a downloadable file). 
- All settings to be configurable throuh settings widget
- Continuous add mode - Toggle for drawing tools so that user does not have to click the drawing template after adding a feature if the want to create a bunch of features with the same drawing properties.
- Add text filter/search for drawings saved to portal similar to add data widget 
- Share drawing with other users (portal mode only).  User can choose to share a drawing saved to portal with a Portal group.  UI to be altered to be able to look through and load their own drawings or other drawings shared with a group that the user has permissions to contribute to.  Update of saved drawing files is limited to owned drawings and UI should reflect this.   Drawings will need to be tagged appropriately to ensure they are identifiable as shared drawings.  
- Hide/obfuscate existing drawing shapes when using geometry editing tools - orignal geometry and symbology is confusing users while they make changes.   Replace with undo/redo functionality??
- Clip tool - trim lines or clip polygons to the overlapped area of another selected feature


## Demo :
To be created


### Changes

**27 September 2017**  
   
- Alteration to following functions to **Widget.js** in section marked *BEGIN:CHANGE 27 Sep 2017*:  
    -  **\_initLayers** function altered to bypass creating a feature collection and adding it to the map in favour of adding the point, line, area and label features layers to the map un-grouped.  Change made to correct issue found when code ported to WAB 2.5 where it was discovered the when used in conjunction with AddLayers widget and Layers Widget, newly added layers from AddLayers are appearing in the feature collection group in the layers list if the drawing layers are located at the top of the layer stack.   Label for layer that holds text label drawings changed to use new property in nls strings file called "labels" nls"

- New parameter added to nls strings.js file for text labels to be used in preference to "text" value used for title of the layer which holds the text label graphics 

**18 March 2018**

- Bugfix for issue when point graphics using picture marker symbols opened selected and displayed in symbol editor, the symbol settings were not being applied in the symbol editor.  Alteration made in **Widget.js** file in the **editorSymbolChooserConfigure** method to switch the order that the **showByType** and **showBySymbol** methods are called on the editorSymbolChooser instance.  
- User client side settings added for choosing whether to load any drawings stored in the local storage from the previous session.  New toggle button added to the **Settings** tab on the widget.  Requires that the widget have allow local storage setting in the config set to true, otherwise client toggle option is hidden. 

**05 May 2019**

- Port to WAB 2.12 - no changes
