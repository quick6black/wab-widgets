define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/on',
		'dojo/dom-class',
		'dojo/dom-attr',
		'dijit/_WidgetBase',
		'dijit/_TemplatedMixin',
		'dojo/text!./widget.html',
	],function(declare, lang, on, domClass, domAttr, _WidgetBase, _TemplatedMixin, widgetTemplate){
		return declare('GroupThumbWidget',[_WidgetBase, _TemplatedMixin],{
			templateString:widgetTemplate,
			_item:null,
			_callback:null,
			constructor:function(item, callback){
				this._item = item;
				this._callback = callback;
			},
			startup:function(){

				this.titleNode.textContent = this._item.Title;
				this.badgeNode.textContent = this._item.Items;
				this.set("title", this._item.Title);
				this.set("itemCount", this._item.Items + " maps & apps");

				if(this._item.Thumbnail){
					var id = this._item.Id;
					var thumbnail = this._item.Thumbnail;

					domAttr.set(this.imageNode,"alt" , this._item.Title);
					domAttr.set(this.imageNode,"src" , "http://www.arcgis.com/sharing/rest/community/groups/" + id + "/info/" + thumbnail);

					domClass.remove(this.parameterImageNode, 'hide');
				}
			},
			_onClick:function(e){
				this._callback(null, this._item);
			}
		});
	});
