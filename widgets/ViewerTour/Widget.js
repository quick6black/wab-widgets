define(
    [
        'dojo/_base/declare', 
        'dojo/_base/array',
        'jimu/BaseWidget',
        'jimu/WidgetManager',
        './Tour'
    ], 
    function(
        declare, 
        array,
        BaseWidget,
        WidgetManager,
        Tour
        ) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'viewer-tour',
    // this property is set by the framework when widget is loaded.
    // name: 'ViewerTour',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('ViewerTour::postCreate');

      this.widgetManager = WidgetManager.getInstance();

      this.tour = new Tour({
        name: this.config.tourName,
        backdrop: this.config.backdrop,
        autoscroll: this.config.autoscroll,
        keyboard: this.config.keyboard
      });

      // Add widget references
      array.forEach(this.config.widgets, function(widgetConfig) {
        var widgets = this.widgetManager.getWidgetsByName(widgetConfig.widgetName);
        if (widgets.length > 0) {
            var widget = widgets[0];

            /*
            this.tour.addStep({
                "title": widgetConfig.title,
                "content": widgetConfig.content,
                "placement": widgetConfig.placement,
                "element":
            });
            */

        }



      });


    },

     startup: function() {
       this.inherited(arguments);
       console.log('ViewerTour::startup');
     }

    // onOpen: function(){
    //   console.log('ViewerTour::onOpen');
    // },

    // onClose: function(){
    //   console.log('ViewerTour::onClose');
    // },

    // onMinimize: function(){
    //   console.log('ViewerTour::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('ViewerTour::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('ViewerTour::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('ViewerTour::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('ViewerTour::onPositionChange');
    // },

    // resize: function(){
    //   console.log('ViewerTour::resize');
    // }

    //methods to communication between widgets:

  });

});
