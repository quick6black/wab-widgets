///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2018 Esri. All Rights Reserved.
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
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/dom-class", "./SearchComponent", "dojo/text!./templates/ScopeOptions.html", "dojo/i18n!../nls/strings", "./util"], function (declare, lang, array, domClass, SearchComponent, template, i18n, util) {

  return declare([SearchComponent], {

    i18n: i18n,
    templateString: template,
    curated1Filter: null,
    curated2Filter: null,
    curated3Filter: null,
    curated4Filter: null,
    curated5Filter: null,
    curated6Filter: null,
    curated7Filter: null,
    curated8Filter: null,
    curated9Filter: null,
    curated10Filter: null,

    postCreate: function postCreate() {
      this.inherited(arguments);
    },

    startup: function startup() {
      if (this._started) {
        return;
      }
      this.inherited(arguments);
      this.initOptions();
      //console.warn("ScopeOptions.startup",this.searchPane.portal);
    },

    hideDropdown: function hideDropdown() {
      domClass.remove(this.scopePlaceholder, "opened");
      domClass.remove(this.btnGroup, "show");
    },

    initOptions: function initOptions() {
      var context = this.searchPane.searchContext;
      var hasUsername = typeof context.username === "string" && context.username.length > 0;
      //var hasOrgId = (typeof context.orgId === "string" && context.orgId.length > 0);
      var options = this.getConfig().scopeOptions;
      this.curated1Filter = options.Curated1.filter;
      this.curated2Filter = options.Curated2.filter;
      this.curated3Filter = options.Curated3.filter;
      this.curated4Filter = options.Curated4.filter;
      this.curated5Filter = options.Curated5.filter;
      this.curated6Filter = options.Curated6.filter;
      this.curated7Filter = options.Curated7.filter;
      this.curated8Filter = options.Curated8.filter;
      this.curated9Filter = options.Curated9.filter;
      this.curated10Filter = options.Curated10.filter;
      var activeNode = null;

      var initOption = function initOption(name, node) {
        var opt = options[name];
        if (opt && opt.allow) {
          if (typeof opt.label === "string" && lang.trim(opt.label).length > 0) {
            util.setNodeText(node, lang.trim(opt.label));
          } else {
            if (!hasUsername && name === "MyOrganization") {
              // "My Organization as a label doesn't make sense
              util.setNodeText(node, i18n.search.scopeOptions.anonymousContent);
            }
          }
          if (options.defaultScope === name) {
            activeNode = node;
          }
        } else {
          node.style.display = "none";
        }
      };
      initOption("MyContent", this.MyContentToggle);
      initOption("MyOrganization", this.MyOrganizationToggle);
      initOption("Curated1", this.Curated1Toggle);
      initOption("Curated2", this.Curated2Toggle);
      initOption("Curated3", this.Curated3Toggle);
      initOption("Curated4", this.Curated4Toggle);
      initOption("Curated5", this.Curated5Toggle);
      initOption("Curated6", this.Curated6Toggle);
      initOption("Curated7", this.Curated7Toggle);
      initOption("Curated8", this.Curated8Toggle);
      initOption("Curated9", this.Curated9Toggle);
      initOption("Curated10", this.Curated10Toggle);
      initOption("ArcGISOnline", this.ArcGISOnlineToggle);

      if (!activeNode) {
        if (options.MyOrganization.allow) {
          activeNode = this.MyOrganizationToggle;
        } else if (options.ArcGISOnline.allow) {
          activeNode = this.ArcGISOnlineToggle;
        } else if (options.Curated1.allow) {
          activeNode = this.Curated1Toggle;
        } else if (options.Curated2.allow) {
          activeNode = this.Curated2Toggle;
        } else if (options.Curated3.allow) {
          activeNode = this.Curated3Toggle;
        } else if (options.Curated4.allow) {
          activeNode = this.Curated4Toggle;
        } else if (options.Curated5.allow) {
          activeNode = this.Curated5Toggle;
        } else if (options.Curated6.allow) {
          activeNode = this.Curated6Toggle;
        } else if (options.Curated7.allow) {
          activeNode = this.Curated7Toggle;
        } else if (options.Curated8.allow) {
          activeNode = this.Curated8Toggle;
        } else if (options.Curated9.allow) {
          activeNode = this.Curated9Toggle;
        } else if (options.Curated10.allow) {
          activeNode = this.Curated10Toggle;
        } else if (options.MyContent.allow) {
          activeNode = this.MyContentToggle;
        }
      }
      if (activeNode) {
        domClass.add(activeNode, "active");
        this.scopePlaceholderText.innerHTML = activeNode.innerHTML;
      }
    },

    optionClicked: function optionClicked(evt) {
      this.toggleClassName(evt);
      this.hideDropdown();
      this.search();
    },

    scopePlaceholderClicked: function scopePlaceholderClicked(evt) {
      evt.preventDefault();
      if (domClass.contains(this.scopePlaceholder, "opened")) {
        this.hideDropdown();
      } else {
        this.showDropdown();
      }
    },

    showDropdown: function showDropdown() {
      // this.btnGroup.style.top = this.domNode.clientHeight + "px";
      domClass.add(this.scopePlaceholder, "opened");
      domClass.add(this.btnGroup, "show");
    },

    toggleClassName: function toggleClassName(evt) {
      array.forEach(this.btnGroup.children, function (node) {
        domClass.remove(node, "active");
      });
      domClass.add(evt.target, "active");
      this.scopePlaceholderText.innerHTML = evt.target.innerHTML;
    },

    /* SearchComponent API ============================================= */

    appendQueryParams: function appendQueryParams(params, task) {
      var scope = null;
      array.some(this.btnGroup.children, function (node) {
        if (domClass.contains(node, "active")) {
          scope = node.getAttribute("data-option-name");
          return true;
        }
      });
      if (typeof scope === "undefined") {
        scope = null;
      }
      //console.warn("scope",scope);

      var q = null;
      var curated1Filter = this.curated1Filter;
      var curated2Filter = this.curated2Filter;
      var curated3Filter = this.curated3Filter;
      var curated4Filter = this.curated4Filter;
      var curated5Filter = this.curated5Filter;
      var curated6Filter = this.curated6Filter;
      var curated7Filter = this.curated7Filter;
      var curated8Filter = this.curated8Filter;
      var curated9Filter = this.curated9Filter;
      var curated10Filter = this.curated10Filter;
      var context = this.searchPane.searchContext;
      var username = context.username;
      var orgId = context.orgId;
      var considerOrg = true;
      if (context.portal && context.portal.isPortal) {
        considerOrg = false;
      }

      if (scope === "MyContent") {
        if (typeof username === "string" && username.length > 0) {
          q = "(owner:" + util.escapeForLucene(username) + ")";
        }
      } else if (scope === "MyOrganization") {
        if (considerOrg && typeof orgId === "string" && orgId.length > 0) {
          q = "(orgid:" + util.escapeForLucene(orgId) + ")";
        }
      } else if (scope === "Curated1") {
        if (typeof curated1Filter === "string" && curated1Filter.length > 0) {
          q = curated1Filter;
        }
      } else if (scope === "Curated2") {
        if (typeof curated2Filter === "string" && curated2Filter.length > 0) {
          q = curated2Filter;
        }
      } else if (scope === "Curated3") {
        if (typeof curated3Filter === "string" && curated3Filter.length > 0) {
          q = curated3Filter;
        }
      } else if (scope === "Curated4") {
        if (typeof curated4Filter === "string" && curated4Filter.length > 0) {
          q = curated4Filter;
        }
      } else if (scope === "Curated5") {
        if (typeof curated5Filter === "string" && curated5Filter.length > 0) {
          q = curated5Filter;
        }
      } else if (scope === "Curated6") {
        if (typeof curated6Filter === "string" && curated6Filter.length > 0) {
          q = curated6Filter;
        }
      } else if (scope === "Curated7") {
        if (typeof curated7Filter === "string" && curated7Filter.length > 0) {
          q = curated7Filter;
        }
      } else if (scope === "Curated8") {
        if (typeof curated8Filter === "string" && curated8Filter.length > 0) {
          q = curated8Filter;
        }
      } else if (scope === "Curated9") {
        if (typeof curated9Filter === "string" && curated9Filter.length > 0) {
          q = curated9Filter;
        }
      } else if (scope === "Curated10") {
        if (typeof curated10Filter === "string" && curated10Filter.length > 0) {
          q = curated10Filter;
        }
      } else if (scope === "ArcGISOnline") {
        if (context.allowArcGISOnline) {
          task.scopeIsArcGISOnline = true;
        }
      }

      if (q !== null && q.length > 0) {
        q = "(" + q + ")";
        if (params.q !== null && params.q.length > 0) {
          params.q += " AND " + q;
        } else {
          params.q = q;
        }
      }
    }

  });
});
