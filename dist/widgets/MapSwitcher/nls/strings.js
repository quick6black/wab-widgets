define({
  root: {
   _widgetLabel: "Map Switcher",

    noOptionsConfigured: "No options were configured.",

    tabs: {
      search: "Search"
    },

    search: {
      mapInaccessible: "The layer is inaccessible.",
      loadError: "MapSwitcher, unable to load:",    	
      searchBox: {
        search: "Search",
        placeholder: "Search..."
      },    
      scopeOptions: {
        anonymousContent: "Content",
        myContent: "My Content",
        myOrganization: "My Organization",
        curated: "Curated",
        ArcGISOnline: "ArcGIS Online"
      },
      sortOptions: {
        prompt: "Sort By:",
        relevance: "Relevance",
        title: "Title",
        owner: "Owner",
        rating: "Rating",
        views: "Views",
        date: "Date",
        switchOrder: "Switch"
      },
      resultsPane: {
        noMatch: "No results were found."
      },
      paging: {
        first: "<<",
        firstTip: "First",
        previous: "<",
        previousTip: "Previous",
        next: ">",
        nextTip: "Next",
        pagePattern: "{page}"
      },
      resultCount: {
        countPattern: "{count} {type}",
        itemSingular: "Item",
        itemPlural: "Items"
      },
      item: {
        actions: {
          open: "Open",
          details: "Details",
          done: "Done",
          editName: "Edit Name"
        },
        messages: {
          opening: "Opening...",
          unsupported: "Unsupported"
        },
        typeByOwnerPattern: "{type} by {owner}",
        dateFormat: "MMMM d, yyyy",
        datePattern: "{date}",
        ratingsCommentsViewsPattern: "{ratings} {ratingsIcon} {comments} {commentsIcon} {views} {viewsIcon}",
        ratingsCommentsViewsLabels: {"ratings": "ratings", "comments": "comments", "views": "views"},
        types: {
          "KML": "KML"
        }
      }

  	}
  }
  // add supported locales below:
  // , "zh-cn": true
});
