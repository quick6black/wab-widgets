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
		return declare('AppThumbWidget',[_WidgetBase, _TemplatedMixin],{
			templateString:widgetTemplate,
			_item:null,
			_callback:null,
			constructor:function(item, callback){
				this._item = item;
				this._callback = callback;
			},
			startup:function(){
				this.inherited(arguments);

				this.resultTitleNode.textContent = this._item.Title;
				this.resultTitleSnippet.textContent = this._item.Snippet;

				var imgSrc = "http://www.arcgis.com/sharing/rest/content/items/" +
					this._item.Id + "/info/" + this._item.ThumbnailUrl;

				domAttr.set(this.resultImageNode, "src", imgSrc);
				domAttr.set(this.resultImageNode, "alt", imgSrc);
				domClass.add(this.resultGlyphiconNode, "glyphicon-phone");

				on(this.resultOpenButtonNode, "click", lang.hitch(this, this._openWebApp));
				on(this.resultDetailsButtonNode, "click", lang.hitch(this, this._openDetails));
			},
			_openWebApp:function(e){
				e.preventDefault();
				var response = {
					item: this._item,
					action: "openWebApp"
				};
				this._callback(null, response);
			},
			_openDetails:function(/*Event*/ e){
				 e.preventDefault();
				 var response = {
					 item: this._item,
					 action: "openDetails"
				 };
				 this._callback(null, response);
			}
		});
	});
