define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./widget.html',
],function(declare, _WidgetBase, _TemplatedMixin, widgetTemplate){
  return declare('SearchWidget',[_WidgetBase, _TemplatedMixin],{
    templateString:widgetTemplate,
    _searchTextCallback:null,
    _description:"",
    constructor:function(options){
      this._searchTextCallback = options.searchTextCallback;
      this._searchByCategoryCallback = options.searchByCategoryCallback;
      this._searchByOrganisationCallback = options.searchByOrganisationCallback;
      this._description = options.description;
    },
    startup:function(){
      this.searchDescriptionNode.textContent = this._description;
    },
    searchText:function(/* Event */ e){
		e.preventDefault();
      this._searchTextCallback(null, this.searchInputNode.value);
    },
    searchByCategory:function(/* Event */ e){
		e.preventDefault();
      this._searchByCategoryCallback(null, true);
    },
    searchByOrganisation:function(/* Event */ e){
		e.preventDefault();
      this._searchByOrganisationCallback(null, true);
    }
  });
});
