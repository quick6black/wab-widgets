define(['dojo/_base/declare', 'dojo/_base/lang', 'esri/request'], function (declare, lang, esriRequest) {
  return declare("RetrieveWebMapGroups", [], {
    _baseUri: "",
    _callback: null,
    constructor: function constructor(options) {
      this._baseUri = options.baseUri;
    },
    request: function request(type, callback) {

      this._callback = callback;

      var requestUri = this._baseUri + "/" + type;
      var requestGroups = esriRequest({
        url: requestUri,
        content: { f: "json" }
      });

      requestGroups.then(lang.hitch(this, this._response), this._error);
    },
    _response: function _response(response) {
      var groups = response;
      this._callback(null, groups);
    },
    _error: function _error(error) {
      this._callback(error, null);
    }
  });
});
