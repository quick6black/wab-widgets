define(['dojo/_base/declare', 
    "dojo/_base/lang",
    "dojo/on",
    "dojo/aspect",
    "dojo/Deferred",
    "dojo/dom-class",
    "jimu/portalUrlUtils",
    "jimu/portalUtils",
    "jimu/tokenUtils",
    "jimu/BaseWidget",
    "jimu/dijit/TabContainer3",
    "dijit/_WidgetsInTemplateMixin",
    "./search/SearchContext",
    "./search/util",
    "./search/SearchPane"
],
function(declare, lang, on, aspect, Deferred, domClass, portalUrlUtils, portalUtils,
    tokenUtils, BaseWidget, TabContainer3, _WidgetsInTemplateMixin, SearchContext,
    util, SearchPane) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget, _WidgetsInTemplateMixin], {

    baseClass: 'jimu-widget-map-switcher',

    name: 'MapSwitcher',
  
    _isOpen: false,
    _searchOnOpen: false,

    tabContainer: null,
    searchPane: null,

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('MapSwitcher::postCreate');
    },

    startup: function() {
        if (this._started) {
          return;
        }
        var self = this,  args = arguments;
        this._getUser().then(function(user) {
          self._checkConfig();
          self._initTabs();
          return self._initContext(user);
        }).then(function() {
          self.inherited(args);
          if (self.tabContainer) {
            self.tabContainer.startup();
          } else if (self.searchPane) {
            self.searchPane.startup();
          }
          self._initFooter(self.tabContainer, {
            "searchWidget": self.searchPane
          });
          self._initListeners();
          self.resize();
          //console.warn("MapSwitcher.startup",this);
        }).otherwise(function(error) {
          console.warn("MapSwitcher.startup error:", error);
          self.inherited(args);
          self.resize();
        });


       console.log('MapSwitcher::startup');
    },

      _checkConfig: function() {
        if (!this.config) {
          this.config = {};
        }
        var initOption = function(options,name) {
          var opt = options[name];
          if (!opt) {
            opt = options[name] = {
              allow: true,
              label: null
            };
          }
          if (typeof opt.allow !== "boolean") {
            opt.allow = true;
          }

          var curatedNames = ["Curated1", "Curated2", "Curated3"];

          if (curatedNames.indexOf(name) >= 0) {
            if (typeof opt.filter !== "string" || lang.trim(opt.filter).length === 0) {
              opt.allow = false;
            }
          }
        };
        var config = this.config;
        if (!config.scopeOptions) {
          config.scopeOptions = {};
        }
        var options = config.scopeOptions;
        initOption(options,"MyContent");
        initOption(options,"MyOrganization");
        initOption(options,"Curated1");
        initOption(options,"Curated2");
        initOption(options,"Curated3");
        initOption(options,"ArcGISOnline");
      },

      getSharingUrl: function() {
        var p = portalUtils.getPortal(this.appConfig.portalUrl);
        return portalUrlUtils.getSharingUrl(p.portalUrl);
      },

      _getUser: function() {
        var dfd = new Deferred();
        var portalUrl = this.appConfig.portalUrl;
        if (tokenUtils.userHaveSignInPortal(portalUrl)) {
          portalUtils.getPortal(portalUrl).getUser().then(function(user) {
            dfd.resolve(user);
          }).otherwise(function(error) {
            console.warn("MapSwitcher._getUser error:", error);
            dfd.resolve(null);
          });
        } else {
          dfd.resolve(null);
        }
        return dfd;
      },

      _initContext: function(user) {
        var dfd = new Deferred(), bResolve = true;
        // TODO configure this?
        var arcgisOnlineUrl = util.checkMixedContent("http://www.arcgis.com");
        var scopeOptions = this.config.scopeOptions;
        var hasUsername = (user && typeof user.username === "string" && user.username.length > 0);
        var searchContext = new SearchContext();
        var portal = portalUtils.getPortal(this.appConfig.portalUrl);
        searchContext.portal = portal;
        if (user) {
          if (typeof user.orgId === "string" && user.orgId.length > 0) {
            searchContext.orgId = user.orgId;
          }
        }
        if (hasUsername) {
          searchContext.username = user.username;
        } else {
          scopeOptions.MyContent.allow = false;
        }
        if (this.searchPane) {
          this.searchPane.searchContext = searchContext;
          this.searchPane.portal = portal;
        }
        //console.warn("MapSwitcher.portal",portal);

        var msg = this.nls.search.loadError + arcgisOnlineUrl;
        var arcgisOnlineOption = scopeOptions.ArcGISOnline;
        searchContext.allowArcGISOnline = arcgisOnlineOption.allow;
        if (portal.isPortal && searchContext.allowArcGISOnline) {
          var arcgisOnlinePortal = portalUtils.getPortal(arcgisOnlineUrl);
          if (!arcgisOnlinePortal) {
            console.warn(msg);
            searchContext.allowArcGISOnline = false;
            arcgisOnlineOption.allow = false;
          } else {
            if (!arcgisOnlinePortal.helperServices) {
              bResolve = false;
              arcgisOnlinePortal.loadSelfInfo().then(function() {
                if (!arcgisOnlinePortal.helperServices) {
                  console.warn(msg);
                  searchContext.allowArcGISOnline = false;
                  arcgisOnlineOption.allow = false;
                } else {
                  searchContext.arcgisOnlinePortal = arcgisOnlinePortal;
                  //console.warn("searchContext.arcgisOnlinePortal",arcgisOnlinePortal);
                }
                dfd.resolve();
              }).otherwise(function(error) {
                searchContext.allowArcGISOnline = false;
                arcgisOnlineOption.allow = false;
                console.warn(msg);
                console.warn(error);
                dfd.resolve();
              });
            }
          }
          //console.warn("arcgisOnlinePortal",arcgisOnlinePortal);
        } else {
          if (!hasUsername && !portal.isPortal) {
            // MyOrganization and ArcGISOnline are equivalent, - PUBLIC
            if (scopeOptions.MyOrganization.allow && scopeOptions.ArcGISOnline.allow) {
              scopeOptions.MyOrganization.allow = false;
            }
          }
        }
        if (bResolve) {
          dfd.resolve();
        }
        return dfd;
      },

      _initFooter: function(parentNode, widgets) {
        if(parentNode) {
          var searchWidget = widgets.searchWidget,
              hasSearchFooter = false;
          if(searchWidget &&
             searchWidget.footerNode &&
             searchWidget.footerNode.nodeName) {
            hasSearchFooter = true;
          }
          var footerContainer = this.footerContainer = document.createElement("DIV");
          footerContainer.className = this.baseClass + "-footer";
          if(hasSearchFooter) {
            footerContainer.appendChild(searchWidget.footerNode);
          }
        
          var messageNode = this.messageNode = document.createElement("SPAN");
          messageNode.className = "message";
          footerContainer.appendChild(messageNode);
          var targetNode = parentNode.containerNode || parentNode.domNode || parentNode;
          if(targetNode.nodeName) {
            targetNode.appendChild(footerContainer);
          }
          this.own(on(this.tabContainer, "tabChanged", lang.hitch(this, function(title) {
            this._setStatus("");
            if(hasSearchFooter) {
              searchWidget.footerNode.style.display = title === this.nls.tabs.search ? "" : "none";
            }
            if(this.nls.tabs.search === title) {
              if(hasSearchFooter) {
                searchWidget.footerNode.style.display = "";
              }
              messageNode.style.display = "none";
            } else {
              if(hasSearchFooter) {
                searchWidget.footerNode.style.display = "none";
              }
              messageNode.style.display = "";
            }
          })));
        }
      },

     _initListeners: function() {
        var self = this;
      },

      _initTabs: function(){
        var config = this.config, tabs = [];
        //console.warn("config",config);

        var supportsFile = !!(window.File && window.FileReader && window.FormData);
        var allowSearch = false, options = config.scopeOptions;
        var chkAllowSearch = function(name) {
          if (!allowSearch) {
            if (options && options[name] && options[name].allow) {
              allowSearch = true;
            }
          }
        };
        chkAllowSearch("MyContent");
        chkAllowSearch("MyOrganization");
        chkAllowSearch("Curated1");
        chkAllowSearch("Curated2");
        chkAllowSearch("Curated3");
        chkAllowSearch("ArcGISOnline");

        if (allowSearch) {
          this.searchPane = new SearchPane({
            wabWidget: this
          },this.searchNode);
          tabs.push({
            title: this.nls.tabs.search,
            content: this.searchPane.domNode
          });
        }

        var self = this;
        if (tabs.length > 0) {
          this.tabContainer = new TabContainer3({
            average: true,
            tabs: tabs
          }, this.tabsNode);
          try {
            if (tabs.length === 1 && this.tabContainer.controlNode &&
              this.tabContainer.containerNode) {
              this.tabContainer.controlNode.style.display = "none";
              this.tabContainer.containerNode.style.top = "0px";
              //console.warn("this.tabContainer",this.tabContainer);
            }
          } catch(ex1) {}
          //this.tabContainer.hideShelter();
          this.own(aspect.after(this.tabContainer,"selectTab",function(title){
            //console.warn("selectTab",title);
            if (self.searchPane && title === self.nls.tabs.search) {
              self.searchPane.resize();
            }
          },true));
        } else if (tabs.length === 0) {
          this.tabsNode.appendChild(document.createTextNode(this.nls.noOptionsConfigured));
        }
      },

      _setStatus: function(msg) {
        if (!this.messageNode) {
          return;
        }
        util.setNodeText(this.messageNode, msg);
        this.messageNode.title = msg;
      },


    onOpen: function(){
        var bSearch = (this.searchPane && this._searchOnOpen);
        this._isOpen = true;
        this._searchOnOpen = false;
        this.resize();
        if (bSearch) {
          this.searchPane.search();
        }
        console.log('MapSwitcher::onOpen');
    },

    onClose: function(){
        this._isOpen = false;
        console.log('MapSwitcher::onClose');
    },

    // onMinimize: function(){
    //   console.log('MapSwitcher::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('MapSwitcher::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('MapSwitcher::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('MapSwitcher::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('MapSwitcher::onPositionChange');
    // },

    resize: function(){
        var widgetWidth = this.domNode.clientWidth,
            widgetHeight = this.domNode.clientHeight;
        if (widgetWidth > 1000) {
          domClass.remove(this.domNode, "width-768");
          domClass.add(this.domNode, "width-1200");
        } else if (widgetWidth > 768) {
          domClass.remove(this.domNode, "width-1200");
          domClass.add(this.domNode, "width-768");
        } else {
          domClass.remove(this.domNode, ["width-768", "width-1200"]);
        }

        if (widgetWidth < 420) {
          domClass.remove(this.domNode, "width-medium");
          domClass.add(this.domNode, "width-small");
        } else if (widgetWidth < 750) {
          domClass.remove(this.domNode, "width-small");
          domClass.add(this.domNode, "width-medium");
        } else {
          domClass.remove(this.domNode, ["width-small", "width-medium"]);
        }

        //console.warn("widgetWidth",widgetWidth);
        if (widgetWidth < 340) {
          domClass.add(this.domNode,"filter-placeholder-on");
        } else {
          domClass.remove(this.domNode,"filter-placeholder-on");
        }

        if(widgetHeight < 400) {
          domClass.add(this.domNode, "height-small");
        } else {
          domClass.remove(this.domNode, "height-small");
        }

        if (this.searchPane) {
          this.searchPane.resize();
        }

       console.log('MapSwitcher::resize');
    }

    //methods to communication between widgets:

  });

});
