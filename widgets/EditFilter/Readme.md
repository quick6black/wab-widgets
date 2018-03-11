#Changes from Existing Group Filter Widget

*Based off ESRI Group Widget from WAB Developer Edition v2.4*  



### Changes

**29 May 2017**     


- Addition of following functions to **Widget.js** in section marked *BEGIN: Ecan Changes*:  
    -  **checkURIParameters** function.  Checks the current application url for query parameters and if one with a name filter is located, initiates an update to the widget's group config settings to update the default value to the parsed url parameter.
    -  **\_getFilterParam** function formats the query parameter value from the url into a format that the checkURIParamters function uses to set the group and filter expression value.
- Alteration to the **postCreate** function.  Addition of a call to the **checkURIParamters** function.
- Addition of following references in DEFINE block of to **Widget.js** :
	- *esri/urlUtils* reference added to widget to parse url to look for filter parameters in the current application url.


**11 July 2017**

-  Alteration of following functions to **Widget.js** in section marked *BEGIN: ECAN CHANGES - Modification to handle point features*: 
	-  **\_queryExtentToZoom** function.  Fix for issue when returned dataset is a single point.  Buffer of extent with zero area fails, meaning the widget does not zoom to show the point.  Function now checks extent for zero area i.e. xmin = xmax and ymin = ymax and if found, creates a point to buffer rather than using the extent which would fail.  Change made to both the planar and goedesic buffer functions.


**02 November 2017**

-  **Upgrade to WAB 2.6 Code to include changes that are part of v2.6 Group Filter widget, specifically the configurable option to persist the filter after the widget is closed.**
	-  Changes to settings component: Setting.html, Setting.js, strings.js 
	-  Changes to config.json, VersionManager.js, Widget.js, presetValuePicker.js

-  Alteration of following functions to **Widget.js** in section marked *BEGIN: ECAN CHANGES - Include fit value = true*: 
	-  **\_queryExtentToZoom** function.  Alteration to setExtent call on map to include the fit parameter with value of true to make sure the extent is fully displayed within the display area of the map.