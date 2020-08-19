# Map Switcher Widget
Map Switcher Widget for Web AppBuilder for ArcGIS.

This widget allows users of to change to search for and load another web map from ArcGIS Online or Portal for ArcGIS.  When loading a map, it does so utilisng the URL parameters that the Web AppBuilder viewer framework supports and refreshing the browser, in much the same way as the Share Widget does. 

Much of the code and function is based on the standard ESRI Add Data widget [https://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm](https://doc.arcgis.com/en/web-appbuilder/create-apps/widget-add-data.htm").

## Known Issues :
When configured to work with ArcGIS Enterprise Portals, the widget should be configured to not include the ArcGIS Online group option as the viewer load map mechanism does not have capability to load maps that are not hosted on the portal. 


## Installation :
Add MapSwitcher folder in your web AppBuilder client\stemapp\widgets folder.
Download Release here : 
https://github.com/CanterburyRegionalCouncil/wab-widgets/releases/latest

## Configuration :
This widget can be set to open automatically when an app starts. To enable this feature, click the **Open this widget automatically when the app starts** button  on the widget, which turns it dark green.



1. Hover over the widget and select **Configure this widget** button to open the configuration properties dialog box.
2. Optionally click **Change widget icon** to replace the default icon for this widget.

	A file explorer window appears, allowing you to load a local image file to use as the widget icon.

3. Optionally change the number of items per page for the search result.

	The default is 30.

4. Use the following options to control the search scope in ArcGIS Online or Portal for ArcGIS. Replace the default labels and select the default search option if necessary.

	- **Allow My Content**—Search for your private data.
	- **Allow My Organization**—Search for data shared within the organization.
	- **Allow ArcGIS Online**—Search for data publicly available though ArcGIS Online or Portal for ArcGIS if applicable.
	- **Allow Curated**—Search for data shared within a group. This requires the group ID with the **group:** prefix as a curated filter.

		Up to 3 curated groups can be configured.


	> **Caution:**  
	> When you deploy the app locally, keep in mind that unlike hosted apps in ArcGIS Online or Portal for ArcGIS, there is no scope control over the deployed app. As a result, you should use the map scope to control the search scope of the Map Switcher widget. If you want to search the Maps in **My Organization** or **My Content**, make sure the map is not shared publicly. In this way, when the deployed app opens, the sign in the dialog box shows, passing the credentials to the Map Switcher widget. By default, the widget only shows the public content if the credentials are not present.
    

5. Click **OK** to save the configuration.

## Use :

1. On the **Search** tab, choose the scope you want to search and click **Open** on a specific item to change to use that map.  Click **Details** to get information about the layer.

	> **Caution:**  
	> If the app is shared publicly, do not enable **Allow My Organzation** or **Allow My Content** as the search will only execute against the public items.

2. Optionally click the search button to search for maps.
3. Click the sort button to sort the items.
Click the **Sort By** drop-down list to sort items by relevance, title, owner, rating, view, or date.


## Demo :
To be created


## Version :
### Changes

**17 March 2018**     


- Initial development based on WAB 2.6 framework


**14 April 2019**


- Port to WAB 2.12 framework 
 
