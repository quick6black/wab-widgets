define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
], function(declare, lang, on){
  return declare('InViewport',[],{
    _parent:null,
    _child:null,
    _callback:null,
    constructor:function(options){
      this._parent = options.parent;
      this._child = options.child;
      this._callback = options.callback;

      this._scrollListener = on(this._parent, "scroll", lang.hitch(this,this._isInViewport));
    },
    stop:function(){
      this._scrollListener.remove();
    },
    _isInViewport:function(event){

      if(this._isInDom()){
        var parentExtent = this._parent.getBoundingClientRect();
        var childExtent = this._child.getBoundingClientRect();

        if(parentExtent.bottom > childExtent.top){

          if(this._callback)
            this._callback(null, true);
            this._callback = null;

          this._scrollListener.remove();
        }
      }
    },
    _isInDom:function(){
      return this._child.parentNode !== null;
    }
  });
});
