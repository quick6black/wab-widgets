# wab-widgets
Collection of Widgets for Web AppBuilder for ArcGIS.  Some are modified versions of existing widgets customised for use within Environment Canterbury's systems (original widget credited where applicable).

Source code for each widget is located in the **widgets** folder in the root of this project.  The compiled versions are located in under the widgets folder in the **dist** folder. 

Unless otherwise stated in the individual widget's readme file, the widgets have been constructed using the Yeoman ESRI widget generator  [https://github.com/Esri/generator-esri-appbuilder-js](https://github.com/Esri/generator-esri-appbuilder-js").    A "Grunt" script has been included as part of the Yeoman generated scaffolding which if run will compile and distribute the code to an instance of the Web AppBuilder application - take a copy of the *sampe-Gruntfile.js* file, rename it to Gruntfile.js, and alter the **appDir** and **stemappDir** variables in the file to the path of the WAB installation and test app that you want to deploy the widgets to.

 
## Add Data Widget
This is a customised variant of the standard Add Data widget [http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm](http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm) developed by ESRI.

#### Changes made include:  

- Additional curated groups added that allow more than one curated to be set up. 
- Modification made to configure widget in CMaps mode.  If CMapsVersion item on config.json is set to allow:true, the details link on the item card in the layer search will open the configured Open Data endpoint if the layer item is tagged with "Open Data".  If the item does not have the Open Data tag, it will open the item details as per normal functionality.  
- Bug fix in LayerLoader component to correct issue that loading an image layer from Portal/ArcGIS online that has popups enabled in the web item would not set up that popup in the viewer.  

#### Notes
The following are changes that are still needed to be implemented:

- The Open Data details option is currently hard coded for "http://opendata.canterburymaps.govt.nz/datasets/" - this should be updated at some point to be made a configurable item.
- Hard coding in the widget related to the namespace means that this widget must be deployed over the top of the standard AddData widget as opposed to side by side.   

#### Demo
To be deployed in the future


## eDraw Ecan Widget
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


## Select Ecan Widget
This is a customised variant of the standard Select widget [http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-select.htm](http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-select.htm) developed by ESRI.

#### Changes made include:  

- Custom feature action **SelectByGeometryFeatureAction** added to widget that adds functionality to pass the geometry of a feature/featureSet to the Select widget to perform a search as though the user had drawn the shape.  A **Select By Geometry** option is added to the popup action menu for any valid featureSet option in the WAB framework e.g. on popup windows for feature layers, in the options off the select and query widgets, etc.  
- Default selected layer checkbox values can be overriden with config setting to make all either checked on (i.e. as though layer is visible), checked off (layer not visible).  If config value is not supplied, uses standard functionality.
- Change to make option to activate the select dijit a configurable option so that admin can determine if the widget auto starts when opened/activated.


#### Demo
To be deployed in the future


## Edit Filter Widget
This is a customised variant of the standard Group Filter widget [http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-group-filter.htm](http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-group-filter.htm) developed by ESRI.

#### Changes made include:  

- Alteration made that includes a check to look at the url parameters of the viewer during the postCreate stage of the widget lifecycle.  if a parameter of the name **filter** is discovered, the widget will apply the parameter value as the default filter value (overriding any existing default value).  If the widget has multiple groups configured, the filter value can include the name of a group (as recorded in the widget config) and the value to apply separated by colon, and the widget will use that group with the specified value.

` e.g. http://pathtoviewer?filter=Group Name:filtervalue` 


#### Notes
The following are changes that are still needed to be implemented:

- Requires option for calling on open of widget if it is closed
- Reset should apply default values from parameters again if they have been changed
- Change to specified group if multiple groups are configured still to be implemented.

- Developed in conjunction with the Smart Editor (ECan) widget which should accept filter values from widget or the standard Group Filter widget. 

#### Demo
To be deployed in the future

## Smart Editor Widget
This is a customised variant of the standard Smart Editor widget [http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-smart-editor.htm](http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-smart-editor.htm) developed by ESRI.

#### Changes made include:  

- Function that allows widget to work with Group Filter extended to also support the same functionality with the custom Edit Filter.
- Select editable feature option extended to include select by point, select by intersecting line, select by intersecting rectangle and select by intersecting polygon.  Requires user select option from drop down each time to enable the tool.
- **Cut tool** added for breaking line or polygon features into multiple parts.  Requires a single line or polygon feature be selected to be enabled.
- **Merge tool** added for combining two or more selected editable line or polygon features from the same editable layer into a single feature.  The attributes of the feature that has focus in the attribute inspector are preserved. If any point features are selected, the tool is disabled.  If features from more than one editable layer are selected, the tool is disabled.
- **Explode multi-part feature tool** added for breaking multipart features into multiple single part features (lines and polygons only). **NOTE - THIS IS A SIMPLE EXPLODE ONLY AND DOES NOT SUPPORT COMPLEX GEOMETRY SUCH DONUT FEATURES - USING IT IN SUCH SITUATIONS MAY RESULT IN UNEXPECTED OUTCOMES.** 


#### Notes
The following are changes that are still needed to be implemented:

- Requires option for calling on open of widget if it is closed
- Reset should apply default values from parameters again if they have been changed
- Developed in conjunction with the Edit Filter widget and should accept filter values from that widget or the standard Group Filter widget. 

#### Demo
To be deployed in the future


## eLocate Ecan Widget
This is a customised variant of the standard eLocate widget developed by R Sheitlin [https://community.esri.com/docs/DOC-7046](https://community.esri.com/docs/DOC-7046).  It has been modified to support coordinate systems utilised in New Zealand, with additional functionality for handling NZ Standard Topo Map Sheet grid references as an input/output.

#### Changes made include:  

- Locate and address (like the search widget, but gives you the ability to limit the address search to the maps current extent).
- Locate coordinates using user defined spatial reference coordinates (i.e. DMS, State Plane, etc).
- Reverse Geocode capability called Address Inspection. Address Inspection is clicking on the map and getting the address of the map click point. 
- NZ Topo 50 Grid reference added as input or and output type
- NZMS260 Grid reference added as input or and output type

#### Notes
The following are changes that are still needed to be implemented:

- Requires option for calling on open of widget if it is closed
- Reset should apply default values from parameters again if they have been changed
- Developed in conjunction with the Edit Filter widget and should accept filter values from that widget or the standard Group Filter widget. 

#### Demo
To be deployed in the future


## Map Switcher Widget
Map Switcher Widget for Web AppBuilder for ArcGIS.

This widget allows users of to change to search for and load another web map from ArcGIS Online or Portal for ArcGIS.  When loading a map, it does so utilisng the URL parameters that the Web AppBuilder viewer framework supports and refreshing the browser, in much the same way as the Share Widget does. 

Much of the code and function is based on the standard ESRI Add Data widget [https://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm](https://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm").

#### Notes


#### Demo
To be deployed in the future


## Add Local Data Widget for ArcGIS Web AppBuilder
Adds local data to a map - CSV, shapefiles and GPX.

#### Changes made include:  

- None

#### Notes

* Customised version of Add Local Data widget developed by Shaun Weston [Source](https://github.com/WestonSF/ArcGISWebAppBuilderAddLocalDataWidget)


#### Demo
To be deployed in the future
