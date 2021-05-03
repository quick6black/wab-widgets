#Explore Widget#
A Explore widget for the Esri Web App Builder. Allows Environment Canterbury users to search and explore web maps and apps from ArcGIS Online.

##About##
A Explore widget for the Esri Web App Builder. Allows Environment Canterbury users to search and explore web maps and apps from ArcGIS Online.  

This widget does not dynamically search for items on ArcGIS Online. ECAN have a scheduled task which routinely caches item metadata from ArcGIS Online and stores it in a database. The Explore widget queries this database through their [Portal API](http://test.canterburymaps.govt.nz/portalapi/MapGallerySearch?SearchText=[1941]&PageSize=20&Page=1&OrderBy=MostRecent) (a REST web service) as this is faster that dynamically searching ArcGIS Online.

When a user clicks on a web map or app the item itself is opened directly from ArcGIS Online.

##Dependencies##
The widget is dependent on the bootstrap.css. The following file needs to be added to the app's init.js file as per the instructions [here](https://developers.arcgis.com/web-appbuilder/sample-code/add-a-third-party-library.htm).

```JS
'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css',  
```

##Configuration##
The following parameters are configurable through the widgets config.json file.

```JSON
{
    "portalApiUri": "[URL To the Portal API (currently - http://test.canterburymaps.govt.nz/portalapi/)]",
    "configPath": "[Path for searching configration data (currently - TagData)]",
    "searchPath": "[Path for searching configration data (currently - MapGallerySearch)]",
	"description": "Text description displayed in the home widget",
    "pageSize": "[Number of ItemsThumbs showed in a single results page as an int (currently -6)]",
    "orderBy": "[The order items results are returned (currently - MostRecent)]",
    "mapItemUrls": {
        "basicUrl": "[The url of the viewer (in development this is - http://localhost/GalleryWidget)]",
        "itemDetailsUrl": "[The URL of the details page (currently - http://canterburymaps.govt.nz/Map/)]"
    }
}
```


##Widget Structure##
The widget has been developed using a collection of sub widgets found in the ``Explore/Widgets`` directory including:

- Home
- ItemParameter
- ItemParameters
- ItemThumb
- Pagination
- Result

The widget.html file at the root of the Explore Widget directory is empty, rather widgets are added dynamically in order to manage their visibility similar to a stack panel. The Widget has four views including:

- Home - an instance of the home widget
- Categories - an instance of the item parameters widget
- Organisations - an instance of the item parameters widget
- Tags - an instance of the item parameters widget

So all the main panels are instances of either the `Home` or the `ItemParameters` widget. These panels are almost identical in their basic structure. The key difference is that the home widget has a second instance of the `result` widget, which is used to show the initial list of maps and apps.

Aside from this the `Home` and `ItemParameters` widgets have two views a 'parameters' view and a 'result' view all of which are navigated using a Bootstrap breadcrumb component.  The 'parameters' view will always show a list of options for the user to choose.  The ``ItemParameters.isCloud`` property determines whether the results will be displayed in a list view or a cloud view.  A list view is simply a `<ul>` tag populated with ItemParameter widgets. A cloud view is a `<div>` populated with ItemCloudParameter widgets. Clicking on a parameter will send an event to the panels results widget.

The results widget inherits from `Explore\widgets\Result\js\MapGallerySearch.js` and manages searching the Explore REST API, the display of the search results as thumbs (ItemThumb widget) and pagination (Pagination widget). The pagination widget is a modified version of Matt Driscoll's [https://github.com/driskull/dijit-pagination-js](https://github.com/driskull/dijit-pagination-js "dijit-pagination-js").

The `ItemThumb` widget displays metadata about the web map or web mapping application. The user can click on the image or the open button to launch the item in a new window or can click on the description button to open the description page in a new tab.

![](https://github.com/CanterburyRegionalCouncil/ecan-webappbuilder-components/blob/develop/widgets/Gallery/doc/WidgetModel.png)


##Supported Versions##
**Javascript API**: 3.12

**Esri Web AppBuilder**: 1.1
