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

#### Demo
To be deployed in the future

### Deployment
To be completed...

### Use Notes
To be completed...


## SelectEcan Widget
This is a customised variant of the standard Select widget [http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-select.htm](http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-select.htm) developed by ESRI.

#### Changes made include:  

- Custom feature action **SelectByGeometryFeatureAction** added to widget that adds functionality to pass the geometry of a feature/featureSet to the Select widget to perform a search as though the user had drawn the shape.  A **Select By Geometry** option is added to the popup action menu for any valid featureSet option in the WAB framework e.g. on popup windows for feature layers, in the options off the select and query widgets, etc.  

#### Demo
To be deployed in the future

### Deployment
Copy the **SelectEcan** widget folder from the **dist** directory and paste it in the widgets repository. By default, the widgets repository is located under *\client\stemapp\widgets* folder for 2D apps. In this way, your widget is available to the builder. If you prefer to deploy the widget to a specific app only, you can copy the widget folder and paste it in the *stemapp\widgets* within a downloaded app, then configure it in the **app.config** file.

The widget has its own namespace so it can sit quite happily besides the standard Select widget without interference.

Configure as per standard Select widget.

### Use Notes
To be completed...