define([
  'dojo/_base/declare',
],function(declare){
  return declare("show", [], {
    _parentWidget:null,
    _breadCrumbWidget:null,
    _resultsWidget:null,
    _searchWidget:null,
    constructor:function(options){
      this._parentWidget = options.parentWidget;
      this._breadCrumbWidget = options.breadCrumbWidget;
      this._resultsWidget = options.resultsWidget;
      this._searchWidget = options.searchWidget;
    },
    homeView:function(){
      this._removeBreadCrumbWidget();
      this._addSearchWidget();
    },
    categoriesView:function(){
      this._removeSearchWidget();
      this._addBreadCrumbWidget();
    },
    organisationsView:function(){
      this._removeSearchWidget();
      this._addBreadCrumbWidget();
    },
    groupItemResultsView:function(){
      //not needed
    },
    searchItemResultsView:function(){
      this._removeSearchWidget();
      this._addBreadCrumbWidget();
    },
    _addSearchWidget:function(){
      if(!this._hasParent(this._searchWidget))
        this._searchWidget.placeAt(this._parentWidget, "first");
    },
    _removeSearchWidget:function(){
      if(this._hasParent(this._searchWidget))
				this._parentWidget.domNode.removeChild(this._searchWidget.domNode);
    },
    _addBreadCrumbWidget:function(){
      if(!this._hasParent(this._breadCrumbWidget))
        this._breadCrumbWidget.placeAt(this._parentWidget, "first");
    },
    _removeBreadCrumbWidget:function(){
      if(this._hasParent(this._breadCrumbWidget))
        this._parentWidget.domNode.removeChild(this._breadCrumbWidget.domNode);
    },
    _hasParent:function(widget){
      return widget.domNode.parentNode !== null;
    }
  });
});
