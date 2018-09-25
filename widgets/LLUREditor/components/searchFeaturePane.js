define([
	"dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    "dojo/Deferred",
    "dojo/dom-class",
    "dijit/Viewport",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/SearchFeaturePane.html",
    "dojo/i18n!../nls/strings", 
    "jimu/dijit/Message",
    "jimu/dijit/CheckBox"       
],
function (
	declare, lang, array, on, Deferred, domClass, Viewport, 
    	_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n,
     	Message, Checkbox
) {
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
	   	
	   	i18n: i18n,
		templateString: template,
		wabWidget: null,

      	postCreate: function() {
        	this.inherited(arguments);
        	this.own(Viewport.on("resize",this.resize()));
      	},

      	destroy: function() {
        	this.inherited(arguments);
        	//console.warn("AddFromFilePane::destroy");
      	},

      	startup: function() {
        	if (this._started) {
        		return;
        	}

		    this.inherited(arguments);

        	var self = this;
        	var v, config = this.wabWidget.config;
        },

        resize: function () {

        } 
    });

});