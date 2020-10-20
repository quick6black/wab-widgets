define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'jimu/BaseWidget',
		'esri/config',
		'./widgets/Search/widget',
		'./widgets/BreadcrumbWidget/widget',
		'./widgets/Result/widget',
		'./js/RetrieveWebMapSearchItems',
		'./js/RetrieveWebMapGroups',
		'./js/RetrieveWebMapGroupItems',
		'./js/QueryResultToResultsList',
		'./js/PortalItemFactory',
		'./js/LaunchItem',
		'./js/Show',
		'./js/InViewPort',
		'xstyle/css!./css/bootstrap3_3_7.css'
],function(declare, lang, BaseWidget, esriConfig,
	SearchWidget, BreadCrumbWidget, Results, RetrieveWebMapSearchItems,
	RetrieveWebMapGroups, RetrieveWebMapGroupItems, QueryResponseToResultsList,
	PortalItemFactory, LaunchItem, Show, InViewPort
){

	return declare([BaseWidget], {
		baseClass: 'gallery-widget',
		_defaultResults:[],
		_currentResults:[],
		startup: function() {

			this.inherited(arguments);

			var options = null;

			options = {
				map:this.map,
				config:this.config
			};
			this._launchItem = new LaunchItem(options);

			options = {homeCallback:lang.hitch(this, this._showHomeView)};
			this._breadCrumbWidget = new BreadCrumbWidget(options);

			options = {
				searchTextCallback:lang.hitch(this, this._triggerRetrieveWebMapSearchItems),
				searchByCategoryCallback:lang.hitch(this, this._showCategoryGroupsView),
				searchByOrganisationCallback:lang.hitch(this, this._showOrganisationGroupsView),
				description:this.config.description,
			};

			this._searchWidget = new SearchWidget(options);
			this._searchWidget.placeAt(this);

			options = {
				groupItemCallback:lang.hitch(this, this._triggerRetrieveWebMapGroupItems),
				appItemCallback:lang.hitch(this, this._handleItemAction),
				mapItemCallback:lang.hitch(this, this._handleItemAction)
			};

			var portalItemFactory = new PortalItemFactory(options);

			this._queryResultToResultsList = new QueryResultToResultsList(portalItemFactory);

			this._results = new Results();
			this._results.placeAt(this, "last");

			options = { baseUri:this.config.portalApiUri };
			this._retrieveWebMapGroupsCategories = new RetrieveWebMapGroups(options);
			this._retrieveWebMapGroupsCategories.request(
			 	"WebMapGroupsForCategories",
			 	lang.hitch(this, this._handleCategoriesGroups)
			);

			this._retrieveWebMapGroupsOrganisations = new RetrieveWebMapGroups(options);
			this._retrieveWebMapGroupsOrganisations.request(
				"WebMapGroupsForOrganisations",
				lang.hitch(this, this._handleOrganisationsGroups)
			);

			options = {
				parentWidget:this,
	      breadCrumbWidget:this._breadCrumbWidget,
	      resultsWidget:this._resultsWidget,
	      searchWidget:this._searchWidget
			};

			this._show = new Show(options);

			options = {
				baseUri:this.config.portalApiUri,
				pageSize:this.config.pageSize
			};

			this._retrieveWebMapGroupItems = new RetrieveWebMapGroupItems(options);
			this._retrieveWebMapGroupItems.offset = 0;

			this._retrieveWebMapSearchItems = new RetrieveWebMapSearchItems(options);
			this._retrieveWebMapSearchItems.query = "";
			this._retrieveWebMapSearchItems.offset = 0;
			this._retrieveWebMapSearchItems.callback = lang.hitch(this, this._handleDefaultWebMapSearchItems);
			this._retrieveWebMapSearchItems.request();

		},_handleDefaultWebMapSearchItems:function(error, response){
			if(error){throw error;}

			var results = response.Results;
			var resultItems = this._defaultResults;
			this._defaultResults = resultItems.concat(this._queryResultToResultsList.addToResultsList(results));
			this._results.addItems(this._defaultResults);

			if(response.TotalCount - this._defaultResults.length > 0){
				options = {
					parent:this.domNode.parentNode,
		    	child:this._defaultResults[this._defaultResults.length-1].domNode,
		      callback:lang.hitch(this, this._retrieveAdditionalDefaultWebMapSearchItems)
				};
				this._inViewPort = new InViewPort(options);
			}
		},
		_retrieveAdditionalDefaultWebMapSearchItems:function(err, response){

			this._retrieveWebMapSearchItems.offset = this._defaultResults.length;
			this._retrieveWebMapSearchItems.query = "";
			this._retrieveWebMapSearchItems.callback = lang.hitch(this, this._handleDefaultWebMapSearchItems);
			this._retrieveWebMapSearchItems.request();

		},_handleCategoriesGroups:function(error, response){
			if(error)
				throw error;

			var searchResults = response;
			this._categories = this
				._queryResultToResultsList
				.addToResultsList(searchResults, "WebMapGroupsForCategories");
		},
		_handleOrganisationsGroups:function(error, response){
			if(error)
				throw error;

			var searchResults = response;
			this._organisations = this.
				_queryResultToResultsList
				.addToResultsList(searchResults, "WebMapGroupsForOrganisations");
		},
		_triggerRetrieveWebMapGroupItems:function(error, response){

			if(response.source == "WebMapGroupsForCategories"){
				this._breadCrumbWidget.addThirdLabel("Results",
					lang.hitch(this, this._showCategoryGroupsView));
			}else if (response.source == "WebMapGroupsForOrganisations") {
				this._breadCrumbWidget.addThirdLabel("Results",
					lang.hitch(this, this._showOrganisationGroupsView));
			}

			this._retrieveWebMapGroupItems.groupID = response.Id;
			this._retrieveWebMapGroupItems.offset = 0;
			this._retrieveWebMapGroupItems.callback = lang.hitch(this, this._handleWebMapGroupItems);

			this._currentSearchTarget = this._retrieveWebMapGroupItems;
			this._currentResults = [];

			this._retrieveWebMapGroupItems.request();
		},
		_triggerRetrieveWebMapSearchItems:function(error, response){

			this._inViewPort.stop();
			this._retrieveWebMapSearchItems.query = response;
			this._retrieveWebMapSearchItems.offset = 0;
			this._retrieveWebMapSearchItems.callback = lang.hitch(this, this._handleWebMapSearchItems);

			this._currentSearchTarget = this._retrieveWebMapSearchItems;
			this._currentResults = [];

			this._retrieveWebMapSearchItems.request();

		},
		_retrieveAdditionalWebMapItems:function(){
			this._currentSearchTarget.offset = this._currentResults.length;
			this._currentSearchTarget.request();
		},
		_handleWebMapGroupItems:function(error, response){

			if(error)
				throw error;

			var searchResults = response.Results;
			var resultItems = this._currentResults;
			this._currentResults = resultItems.concat(this._queryResultToResultsList.addToResultsList(searchResults));
			this._results.addItems(this._currentResults);

			if(response.TotalCount - this._currentResults.length > 0){
				options = {
					parent:this.domNode.parentNode,
		    	child:this._currentResults[this._currentResults.length-1].domNode,
		      callback:lang.hitch(this, this._retrieveAdditionalWebMapItems)
				};
				this._inViewPort = new InViewPort(options);
			}

		},
		_handleWebMapSearchItems:function(error, response){

			if(error)
				throw error;

			var searchResults = response.Results;
			var resultItems = this._currentResults;
			this._currentResults = resultItems.concat(this._queryResultToResultsList.addToResultsList(searchResults));
			this._results.addItems(this._currentResults);

			this._breadCrumbWidget.clearTrail();
			this._breadCrumbWidget.addSecondLabel("Results");
			this._show.searchItemResultsView();

			if(response.TotalCount - this._currentResults.length > 0){
				options = {
					parent:this.domNode.parentNode,
		    	child:this._currentResults[this._currentResults.length-1].domNode,
		      callback:lang.hitch(this, this._retrieveAdditionalWebMapItems)
				};
				this._inViewPort = new InViewPort(options);
			}

		},
		_handleItemAction:function(error, response){
			this._launchItem.open(response);
		},
		_showHomeView:function(err, response){

			this._breadCrumbWidget.clearTrail();
			this._results.addItems(this._defaultResults);
			this._show.homeView();

			options = {
				parent:this.domNode.parentNode,
				child:this._defaultResults[this._defaultResults.length-1].domNode,
				callback:lang.hitch(this, this._retrieveAdditionalDefaultWebMapSearchItems)
			};
			this._inViewPort = new InViewPort(options);

		},
		_showCategoryGroupsView:function(error, response){

			this._inViewPort.stop();
			this._breadCrumbWidget.clearTrail();
			this._breadCrumbWidget.addSecondLabel("Categories");
			this._results.addItems(this._categories);
			this._show.categoriesView();

		},
		_showOrganisationGroupsView:function(error, response){

			this._inViewPort.stop();
			this._breadCrumbWidget.clearTrail();
			this._breadCrumbWidget.addSecondLabel("Districts");
			this._results.addItems(this._organisations);
			this._show.organisationsView();
		},
	});
});
