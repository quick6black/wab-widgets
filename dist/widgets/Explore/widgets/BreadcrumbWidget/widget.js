define(['dojo/_base/declare', 'dijit/_WidgetBase', 'dijit/_TemplatedMixin', 'dojo/text!./widget.html'], function (declare, _WidgetBase, _TemplatedMixin, widgetTemplate) {
  return declare("BreadcrumbWidget", [_WidgetBase, _TemplatedMixin], {
    templateString: widgetTemplate,
    _homeCallback: null,
    _trailCallback: null,
    constructor: function constructor(options) {
      this._homeCallback = options.homeCallback;
    },
    addSecondLabel: function addSecondLabel(trailLabel) {
      this._secondLabelTitle.textContent = trailLabel;
    },
    addThirdLabel: function addThirdLabel(trailLabel, secondLabelCallback) {
      this._trailCallback = secondLabelCallback;
      this._thirdLabelTitle.textContent = trailLabel;
    },
    clearTrail: function clearTrail() {
      this._secondLabelTitle.textContent = "";
      this._trailCallback = null;
      this._thirdLabelTitle.textContent = "";
    },
    _homeClick: function _homeClick(e) {
      e.preventDefault();
      this._homeCallback(null, e);
    },
    _secondLabelClick: function _secondLabelClick(e) {
      e.preventDefault();

      if (this._trailCallback) {
        this._trailCallback(null, e);
      }
    }
  });
});
