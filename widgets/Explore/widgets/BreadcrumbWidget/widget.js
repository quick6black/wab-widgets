define([
  'dojo/_base/declare',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dojo/text!./widget.html',
],function(declare, _WidgetBase, _TemplatedMixin, widgetTemplate){
  return declare("BreadcrumbWidget", [_WidgetBase, _TemplatedMixin], {
    templateString:widgetTemplate,
    _homeCallback:null,
    _trailCallback:null,
    constructor:function(options){
      this._homeCallback = options.homeCallback;
    },
    addSecondLabel:function(trailLabel){
      this._secondLabelTitle.textContent = trailLabel;
    },
    addThirdLabel:function(trailLabel, secondLabelCallback){
      this._trailCallback = secondLabelCallback;
      this._thirdLabelTitle.textContent = trailLabel;
    },
    clearTrail:function(){
      this._secondLabelTitle.textContent = "";
      this._trailCallback = null;
      this._thirdLabelTitle.textContent = "";
    },
    _homeClick:function(e){
      e.preventDefault();
      this._homeCallback(null, e);
    },
    _secondLabelClick:function(e){
      e.preventDefault();

      if(this._trailCallback){
        this._trailCallback(null, e);
      }
    },
  });
});
