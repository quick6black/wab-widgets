define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'jimu-widget-smartEditor-pro',
    // this property is set by the framework when widget is loaded.
    // name: 'SmartEditorPro',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('SmartEditorPro::postCreate');
    }

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('SmartEditorPro::startup');
    // },

    // onOpen: function(){
    //   console.log('SmartEditorPro::onOpen');
    // },

    // onClose: function(){
    //   console.log('SmartEditorPro::onClose');
    // },

    // onMinimize: function(){
    //   console.log('SmartEditorPro::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('SmartEditorPro::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('SmartEditorPro::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('SmartEditorPro::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('SmartEditorPro::onPositionChange');
    // },

    // resize: function(){
    //   console.log('SmartEditorPro::resize');
    // }

    //methods to communication between widgets:

  });

});
