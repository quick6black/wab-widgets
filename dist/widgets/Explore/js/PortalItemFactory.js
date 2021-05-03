define(['dojo/_base/declare', './../widgets/GroupItemThumb/Widget', './../widgets/AppItemThumb/Widget', './../widgets/MapItemThumb/Widget'], function (declare, GroupThumb, AppThumb, MapThumb) {
  return declare("PortalItemFactory", [], {
    constructor: function constructor(options) {
      this._groupItemCallback = options.groupItemCallback;
      this._appItemCallback = options.appItemCallback;
      this._mapItemCallback = options.mapItemCallback;
    },
    createItem: function createItem(rawItem) {
      var thumb = null;

      if (this._isGroup(rawItem)) {
        thumb = new GroupThumb(rawItem, this._groupItemCallback);
      } else {
        if (this._isWebMap(rawItem)) {
          thumb = new MapThumb(rawItem, this._mapItemCallback);
        } else {
          thumb = new AppThumb(rawItem, this._appItemCallback);
        }
      }

      return thumb;
    },
    _isGroup: function _isGroup(item) {
      return !item.hasOwnProperty("Url");
    },
    _isWebMap: function _isWebMap(item) {
      endIndex = item.Url.length;
      startIndex = endIndex - 4; //to account for {id}
      return item.Url.substring(startIndex, endIndex) === "{id}";
    }
  });
});
