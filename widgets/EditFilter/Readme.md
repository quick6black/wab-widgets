#Changes from Existing Group Filter Widget

*Based off ESRI Group Widget from WAB Developer Edition v2.4*  



### Changes

**29 May 2017**     


- Addition of following functions to **Widget.js** in section marked *BEGIN: Ecan Changes*:  
    -  **checkURIParameters** function.  Checks the current application url for query parameters and if one with a name filter is located, initiates an update to the widget's group config settings to update the default value to the parsed url parameter.
    -  **\_getFilterParam** function formats the query paramter value from the url into a format that the checkURIParamters function uses to set the group and filter expression value.
- Alteration to the **postCreate** function.  Addition of a call to the **checkURIParamters** function.
- Addition of following references in DEFINE block of to **Widget.js** :
	- *esri/urlUtils*
