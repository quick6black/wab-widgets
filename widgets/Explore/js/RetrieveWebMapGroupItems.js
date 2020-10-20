define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'esri/request'
], function(declare, lang, esriRequest){
  return declare("RetrieveWebMapGroupItems", [], {
    _baseUri:"",
    _pageSize:-1,
    groupID:"",
    offset:-1,
    callback:null,
    constructor:function(options){
      this._baseUri = options.baseUri;
      this._pageSize = options.pageSize;
    },
    request:function(){

      var requestUri = this._baseUri + "/WebMapsForGroup";
      requestUri+= "?";
      requestUri += "groupid=" + this.groupID;
      requestUri += "&count=" + this._pageSize;
      requestUri += "&offset=" + this.offset;

      var requestGroups = esriRequest({
        url:requestUri
      });

      requestGroups.then(lang.hitch(this, this._response), this._error);
    },
    _response:function(response){
      var groups = response;
      this.callback(null, groups);
    },
    _error:function(error){
      this.callback(groups, null);
    }
  });
});
