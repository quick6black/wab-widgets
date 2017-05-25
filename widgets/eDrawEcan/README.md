# esri-webappbuilder-widget-eDraw-Ecan
Enhanced draw widget for WebApp Builder for ArcGIS.

This is a customised variant of the eDraw widget [https://github.com/magis-nc/esri-webappbuilder-widget-eDraw](https://github.com/magis-nc/esri-webappbuilder-widget-eDraw "https://github.com/magis-nc/esri-webappbuilder-widget-eDraw") developed by MAGIS.

## Improvements :
#### Changes made include:  

- Some styling changes (import and export button images)  
- Import functionality will now handle the file type from the advanced draw widget for the Flex Viewer for ArcGIS.  
- The drawing graphics are now separated into point, polyline, polygon and text layers in the same manner as the standard ESRI draw widget, and can be displayed as operational layers.  Consequently the re-order up and down functionality only works within the context of the layer for the specific geometry types.
- There is now capability to save drawings as a Feature Collection to an ArcGIS Portal/ArcGIS Online if user is logged in and has create permissions.  Drawings are saved to a content folder in the user's **My Content** section which is created if it does not exist.  The folder name can be configured in the widget's settings, as can whether this functionality is enabled or not. Saved drawings in portal can also be reloaded into a map.  User can supply a drawing name and brief description for the drawing that maps to the item title and snipped in portal/ArcGIS online.
- UI added to display a list of all saved drawings in portal/ArcGIS online.  Users can manage saved drawings from UI including deleting them.  A placeholder option for and action that can show details and allow user to rename a drawing is in place, thought this functionality is not developed yet.     
- Advanced geometry options for union of polyline or polygon drawings added, as is a function to explode multipart geometry drawings into individual drawings.  Functionality for creating buffer graphics added.
- Custom feature action in widget now allows features in popups or other widgets to be sent to the eDraw widget and converted to drawing objects.
- 
## configuration :
- export file name.
- Confirm on delete. A confirm dialog when user delete drawing(s) ?
- add up/down buttons in list ? (N.B. : re-ordering can be done with drag&drop)
- Enable local storage. enable auto-saving in local storage and loading saved drawings on widget load.
    - Local storage key : let empty or set a name :
        - if empty, all apps with eDraw widgets share the same local storage (apps on the same server)
        - if not empty, all apps with the same key share the same local storage (apps on the same server)
- Choose availables font families in text plus
- (without UI) set default symbols
- use geometryEngine for measure ?
- specify geometryServer for measure (not used if geometryEngine is activated)
- enable measure by default ? (is measure checkbox checked on polygon/polyline/point add ?)
- measure's labels patterns
        
## Installation :
Add eDrawEcan folder in your webApp Builder client\stemapp\widgets folder.
Download Release here : 
https://github.com/CanterburyRegionalCouncil/wab-widgets/releases/latest

## Demo :
To be created
