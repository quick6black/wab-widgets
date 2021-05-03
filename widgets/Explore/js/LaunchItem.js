define([
  'dojo/_base/declare',
],function(declare){
    return declare("LaunchItem", [], {
      _map:null,
      _config:null,
      constructor:function(options){
        this._map = options.map;
        this._config = options.config;
      },
      open:function(response){

        var url = "";

        if(response.action == "openWebMap"){
  				var exent = "";
  				exent += this._map.extent.xmin + ",";
  				exent += this._map.extent.ymin + ",";
  				exent += this._map.extent.xmax + ",";
  				exent += this._map.extent.ymax + ",";
  				exent += this._map.extent.spatialReference.wkid;

  				url = response.item.Url.replace("{id}", response.item.Id);
  				url += "&extent=" + exent;
  				window.open(url, '_self');

  			}
        else if(response.action == "openWebApp"){
            window.open(response.item.Url, '_self');
        }
        else{ //openDetails
  				url = this._config.itemDetailsUrl + "?webmap=" + response.item.Id;
  				window.open(url, '_blank');
  			}
      }
    });
});
