define([
	'dojo/_base/declare',
	'dojo/dom-class',
	'dijit/_WidgetBase',
	'dijit/_TemplatedMixin',
	'dojo/text!./widget.html',
],function(declare, domClass, _WidgetBase, _TemplatedMixin, widgetTemplate){

		return declare('ResultsWidget', [_WidgetBase, _TemplatedMixin],{
			templateString:widgetTemplate,
			map:null,
			_webMaps:[],
			pageSize:0,
			page:1,
			updatePagination:true,
			itemDetailsUrl:null,
			webMaps:null,
			addItems:function(items){

				var oldItems = this.galleryResultsContainerNode.children;
				for(var i=oldItems.length-1 ; i>=0 ; i--){
					oldItem = oldItems[i];
					this.galleryResultsContainerNode.removeChild(oldItem);
				}

				if(items.length === 0){
					domClass.remove(this.alertNode, 'hide');
				}else{
					domClass.add(this.alertNode, 'hide');
					
					var item = null;

					for(var j = 0; j < items.length; j++){
						item = items[j];
						item.placeAt(this.galleryResultsContainerNode, 'last');
					}
				}
			}
		});
	}
);
