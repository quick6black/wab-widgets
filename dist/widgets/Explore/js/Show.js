define(['dojo/_base/declare'], function (declare) {
  return declare("show", [], {
    _parentWidget: null,
    _breadCrumbWidget: null,
    _resultsWidget: null,
    _searchWidget: null,
    constructor: function constructor(options) {
      this._parentWidget = options.parentWidget;
      this._breadCrumbWidget = options.breadCrumbWidget;
      this._resultsWidget = options.resultsWidget;
      this._searchWidget = options.searchWidget;
    },
    homeView: function homeView() {
      this._removeBreadCrumbWidget();
      this._addSearchWidget();
    },
    categoriesView: function categoriesView() {
      this._removeSearchWidget();
      this._addBreadCrumbWidget();
    },
    organisationsView: function organisationsView() {
      this._removeSearchWidget();
      this._addBreadCrumbWidget();
    },
    groupItemResultsView: function groupItemResultsView() {
      //not needed
    },
    searchItemResultsView: function searchItemResultsView() {
      this._removeSearchWidget();
      this._addBreadCrumbWidget();
    },
    _addSearchWidget: function _addSearchWidget() {
      if (!this._hasParent(this._searchWidget)) this._searchWidget.placeAt(this._parentWidget, "first");
    },
    _removeSearchWidget: function _removeSearchWidget() {
      if (this._hasParent(this._searchWidget)) this._parentWidget.domNode.removeChild(this._searchWidget.domNode);
    },
    _addBreadCrumbWidget: function _addBreadCrumbWidget() {
      if (!this._hasParent(this._breadCrumbWidget)) this._breadCrumbWidget.placeAt(this._parentWidget, "first");
    },
    _removeBreadCrumbWidget: function _removeBreadCrumbWidget() {
      if (this._hasParent(this._breadCrumbWidget)) this._parentWidget.domNode.removeChild(this._breadCrumbWidget.domNode);
    },
    _hasParent: function _hasParent(widget) {
      return widget.domNode.parentNode !== null;
    }
  });
});
