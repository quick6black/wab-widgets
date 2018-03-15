///////////////////////////////////////////////////////////////////////////
// Copyright © 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////
define(["dojo/_base/declare", "dojo/_base/array", "dojo/date/locale", "dojo/dom-class", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dojo/text!./templates/ItemCard.html", "dojo/i18n!../nls/strings", "./util"], function (declare, array, locale, domClass, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, template, i18n, util) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    i18n: i18n,
    templateString: template,

    item: null,
    resultsPane: null,

    _dfd: null,

    postCreate: function postCreate() {
      this.inherited(arguments);

      //ECan
      this.config = this.resultsPane.searchPane.wabWidget.config;
      //
    },

    startup: function startup() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      //ECan
      //this.config = this.wabWidget.config;
      //
      this.render();
    },

    openClicked: function openClicked() {
      var self = this,
          btn = this.openButton;
      if (domClass.contains(btn, "disabled")) {
        return;
      }
      domClass.add(btn, "disabled");

      util.setNodeText(self.messageNode, i18n.search.item.messages.opening);

      alert('Opening map');
    },

    detailsClicked: function detailsClicked() {
      var item = this.item;
      var baseUrl = util.checkMixedContent(item.portalUrl);
      var url = baseUrl + "/home/item.html?id=" + encodeURIComponent(item.id);
      window.open(url);
    },

    formatDate: function formatDate(date) {
      if (typeof date === "number") {
        date = new Date(date);
      }
      var fmt = i18n.search.item.dateFormat;
      return locale.format(date, {
        selector: "date",
        datePattern: fmt
      });
    },

    render: function render() {
      // TODO escape text or not?
      util.setNodeText(this.titleNode, this.item.title);
      util.setNodeTitle(this.titleNode, this.item.title);
      this._renderThumbnail();
      this._renderTypeOwnerDate();
      if (this.canRemove) {
        util.setNodeText(this.addButton, i18n.search.item.actions.remove);
      }
    },

    _renderThumbnail: function _renderThumbnail() {
      var nd = this.thumbnailNode,
          thumbnailUrl = this.item.thumbnailUrl;
      nd.innerHTML = "";
      thumbnailUrl = util.checkMixedContent(thumbnailUrl);
      var thumbnail = document.createElement("IMG");
      thumbnail.src = thumbnailUrl || "widgets/AddData/images/placeholder_120x80.png";
      nd.appendChild(thumbnail);
    },

    _renderTypeOwnerDate: function _renderTypeOwnerDate() {
      var s,
          item = this.item;

      //ECAN Change
      /* Change to display snippet rather than type/owner by default */
      if (item.snippet !== null && item.snippet !== '') {
        s = item.snippet;
      } else {
        // Fall back to original functionality
        var sType = i18n.search.item.types[item.type];
        if (typeof sType === "undefined" || sType === null) {
          sType = item.type;
        }
        var typeByOwnerPattern = i18n.search.item.typeByOwnerPattern;
        s = typeByOwnerPattern.replace("{type}", sType);
        s = s.replace("{owner}", item.owner);
      }

      util.setNodeText(this.typeByOwnerNode, s);

      util.setNodeTitleText(this.typeByOwnerNode, s);

      /* ORIGNAL CODE BLOCK
            var sType = i18n.search.item.types[item.type];
            if (typeof sType === "undefined" || sType === null) {
              sType = item.type;
            }
            var typeByOwnerPattern = i18n.search.item.typeByOwnerPattern;
            s = typeByOwnerPattern.replace("{type}", sType);
            s = s.replace("{owner}", item.owner);
            util.setNodeText(this.typeByOwnerNode, s);
      */
    }

  });
});
