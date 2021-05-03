define(['dojo/_base/declare', 'dojo/_base/lang', 'esri/request'], function (declare, lang, esriRequest) {
  return declare("RetrieveWebMapSearchItems", [], {
    _baseUri: "",
    _pageSize: -1,
    query: "",
    offset: -1,
    callback: null,
    constructor: function constructor(options) {
      this._baseUri = options.baseUri;
      this._pageSize = options.pageSize;
    },
    request: function request(callback) {

      var requestUri = this._baseUri + "/WebMapSearch";
      requestUri += "?";
      requestUri += "query=" + this.query;
      requestUri += "&count=" + this._pageSize;
      requestUri += "&offset=" + this.offset;

      var requestGroups = esriRequest({
        url: requestUri
      });

      requestGroups.then(lang.hitch(this, this._response), this._error);
    },
    _response: function _response(response) {
      var items = response;
      this.callback(null, items);
    },
    _error: function _error(error) {
      this.callback(error, null);
    }
  });
});
