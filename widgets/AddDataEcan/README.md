## Add Data Widget
This is a customised variant of the standard Add Data widget [http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm](http://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm) developed by ESRI.

#### Changes made include:  

- Additional currated groups added that allow more than one currated to be set up. 
- Modification made to configure widget in Canterbury Maps mode.  If CMapsVersion item on config.json is set to allow:true, the details link on the item card in the layer search will open the configured Open Data endpoint if the layer item is tagged with "Open Data".  If the item does not have the Open Data tag, it will open the item details as per normal functionality.  
- Bug fix in LayerLoader component to correct issue that loading an image layer from Portal/ArcGIS online that has popups enabled in the web item would not set up that popup in the viewer.  

#### Notes
The following are changes that are still needed to be implemented:

- The Open Data details option is currently hard coded for "https://opendata.canterburymaps.govt.nz/datasets/" - this should be updated at some point to be made a configurable item.

#### Demo
To be deployed in the future


### Changes

**20 November 2018**

-  **Upgraded to WAB 2.10 code.** Merged changes with base v2.10 Add Data widget.


**16 April 2019**

-  **Upgraded to WAB 2.12 code.** Merged changes with base v2.12 Add Data widget.


**23 June 2021**

-  **Upgraded to WAB 2.20 code.** Merged changes with base v2.20 Add Data widget.  These changes include support for adding in WMTS OGC web services. 
