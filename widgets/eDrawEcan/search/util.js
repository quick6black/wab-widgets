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
define(["dojo/_base/array"], function (array) {

  return {

    checkMixedContent: function checkMixedContent(uri) {
      if (typeof window.location.href === "string" && window.location.href.indexOf("https://") === 0) {
        if (typeof uri === "string" && uri.indexOf("http://") === 0) {
          uri = "https:" + uri.substring("5");
        }
      }
      return uri;
    },

    endsWith: function endsWith(sv, sfx) {
      return sv.indexOf(sfx, sv.length - sfx.length) !== -1;
    },

    escapeForLucene: function escapeForLucene(value) {
      var a = ['+', '-', '&', '!', '(', ')', '{', '}', '[', ']', '^', '"', '~', '*', '?', ':', '\\'];
      var r = new RegExp("(\\" + a.join("|\\") + ")", "g");
      return value.replace(r, "\\$1");
    },

    setNodeText: function setNodeText(nd, text) {
      nd.innerHTML = "";
      if (text) {
        nd.appendChild(document.createTextNode(text));
      }
    },

    setNodeTitle: function setNodeTitle(nd, text) {
      nd.title = "";
      if (text) {
        nd.setAttribute("title", text);
      }
    },

    setNodeHTML: function setNodeHTML(nd, html) {
      nd.innerHTML = "";
      if (html) {
        nd.innerHTML = html;
      }
    }

  };
});
