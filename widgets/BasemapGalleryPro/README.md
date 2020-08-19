# Basemap Gallery Pro Widget (ECan Variant)
Modified version of the standard Basemap Gallery widget for Web AppBuilder for ArcGIS.


## Improvements :
#### Changes made include:  

- Basemaps in the gallery can be displayed in one or more groups which can be changed by selecting an option from a dropdown list.  This function currenly only works when using basemaps from an arcgis portal or arcgis online organisation.  The groups can be configured by either adding a named tag to the the webmap item that is part of the group, or by adding a list of the basemap names that should be included in the group to the group config.  The name displayed for a group can be specified in the config file.  When using the basemap title method to populate the groups, the base maps are displayed in the order they are listed in the config file.  A default group of basemaps can be specified in the config file - if a default group is not specified, the "All Basemaps" group is used.  


## Bugs :

- If webmap ustilises a basemap that the widget has not been configured with, the basemap gallery does not fully load and users cannot change basemaps.


## configuration :
| Setting | Description | Possible Values |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| useGroups | Flag to define whether or not do display the basemap groups functionality. | true - show the groups dropdown display basemaps in groups false - show all basemaps and hide groups functionality |
| defaultBasemapGroup | id value of basemap group that should be displayed when the widget opens if the useGroups option is set to true.  | blank or missing - the "All Basemaps" group is used. value for the "id" tag of one of the config objects in the "groups" array. |
| groups | Array of group settings object for each group of basemaps to be displayed in the widget. | Array of group setting objects (see below). |
| group.id | Unique value used as an id for the group.  This value can be used to specify the defaultBasemapGroup | String value (must be unique and not blank). |
| group.tag | Value of a tag which when set on any webmap item in the current group in arcgis online or the portal that is used to define the standard basemaps will be used to include that map in the group of basemaps to be displayed in the widget.   | String value.  If a tag is specified that none the available webmaps has been marked with, that group will not be displayed. |
| group.label | Text to be displayed as a label in the option in the dropdown for this group. | String value (must not be blank). |
| group.includedBasemaps | Array of string objects that are the names of any basemap in the standard group of basemaps from ArcGIS Online or portal to be included in this basemap group. | Array of strings, must be enclosed in quotes. |

        
## Installation :
Add BasemapGalleryPro folder in your Web AppBuilder client\stemapp\widgets folder.

Download Release here:  
[https://github.com/CanterburyRegionalCouncil/wab-widgets/releases/latest](https://github.com/CanterburyRegionalCouncil/wab-widgets/releases/latest)

## Demo :
To be created


### Changes

**10 May 2019**  
   
- Initial changes to **Widget.js** are in sections marked *BEGIN CHANGE:*  
