# wab-widgets
Collection of Widgets for Web AppBuilder for ArcGIS.  Some are modified versions of existing widgets customised for use within Environment Canterbury's systems (original widget credited where applicable).

Source code for each widget is located in the **widgets** folder in the root of this project.  The comiled read to use versions are located in under the widgets folder in the **dist** folder. 

Unless otherwise stated in the individual widget's readme file, the widgets have been constructed using the Yeoman ESRI widget generator  [https://github.com/Esri/generator-esri-appbuilder-js](https://github.com/Esri/generator-esri-appbuilder-js").    A "Grunt" script has been included as part of the Yeoman generated scaffolding which if run will compile and distribute the code to an instance of the Web AppBuilder application - take a copy of the *sampe-Gruntfile.js* file, rename it to Gruntfile.js, and alter the **appDir** and **stemappDir** variables in the file to the path of the WAB installation and test app that you want to deploy the widgets to.

 
## eDrawEcan Widget
This is a customised variant of the eDraw widget [https://github.com/magis-nc/esri-webappbuilder-widget-eDraw](https://github.com/magis-nc/esri-webappbuilder-widget-eDraw "https://github.com/magis-nc/esri-webappbuilder-widget-eDraw") developed by MAGIS.

#### Changes made include:  

- Some styling changes (import and export button images)  
- Import functionality will now handle the file type from the advanced draw widget for the Flex Viewer for ArcGIS.  
- The drawing graphics are now separated into point, polyline, polygon and text layers in the same manner as the standard ESRI draw widget, and can be displayed as operational layers.  Consequently the re-order up and down functionality only works within the context of the layer for the specific geometry types.
- There is now capability to save drawings as a Feature Collection to an ArcGIS Portal/ArcGIS Online if user is logged in and has create permissions.  Drawings are saved to a content folder in the user's **My Content** section which is created if it does not exist.  The folder name can be configured in the widget's settings, as can whether this functionality is enabled or not. Saved drawings in portal can also be reloaded into a map.  User can supply a drawing name and brief description for the drawing that maps to the item title and snipped in portal/ArcGIS online.
- UI added to display a list of all saved drawings in portal/ArcGIS online.  Users can manage saved drawings from UI including deleting them.  A placeholder option for and action that can show details and allow user to rename a drawing is in place, thought this functionality is not developed yet.     
- Advanced geometry options for union of polyline or polygon drawings added, as is a function to explode multipart geometry drawings into individual drawings.  Functionality for creating buffer graphics added.
- Custom feature action in widget now allows features in popups or other widgets to be sent to the eDraw widget and converted to drawing objects.

#### Demo
To be deployed in the future

### Deployment
To be completed...

### Use Notes
To be completed...