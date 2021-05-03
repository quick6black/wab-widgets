define(['dojo/_base/declare', 'dojo/_base/lang', 'esri/request'], function (declare, lang, esriRequest) {
  return declare("RetrieveWebMapGroupItems", [], {
    _baseUri: "",
    _pageSize: -1,
    groupID: "",
    offset: -1,
    callback: null,
    constructor: function constructor(options) {
      this._baseUri = options.baseUri;
      this._pageSize = options.pageSize;
    },
    request: function request() {

      var requestUri = this._baseUri + "/WebMapsForGroup";
      requestUri += "?";
      requestUri += "groupid=" + this.groupID;
      requestUri += "&count=" + this._pageSize;
      requestUri += "&offset=" + this.offset;

      var requestGroups = esriRequest({
        url: requestUri
      });

      requestGroups.then(lang.hitch(this, this._response), this._error);
    },
    _response: function _response(response) {
      var groups = response;
      this.callback(null, groups);
    },
    _error: function _error(error) {
      this.callback(groups, null);
    }
  });
});
