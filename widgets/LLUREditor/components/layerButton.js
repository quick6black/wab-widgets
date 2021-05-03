define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/date/locale", "dojo/dom-class", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/text!./templates/layerButton.html", "dojo/i18n!../nls/strings"], function (declare, lang, array, locale, domClass, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,
    item: null,

    postCreate: function postCreate() {
      this.inherited(arguments);
    },

    startup: function startup() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this.render();
    },

    buttonClicked: function buttonClicked(evt) {
      this.onClick();
    },

    render: function render() {},

    destroy: function destroy() {
      this.inherited(arguments);
    }
  });
});
