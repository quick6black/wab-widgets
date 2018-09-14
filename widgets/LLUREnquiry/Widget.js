define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'llur-enquiry',
    // this property is set by the framework when widget is loaded.
    // name: 'LLUREnquiry',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('LLUREnquiry::postCreate');
    }

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('LLUREnquiry::startup');
    // },

    // onOpen: function(){
    //   console.log('LLUREnquiry::onOpen');
    // },

    // onClose: function(){
    //   console.log('LLUREnquiry::onClose');
    // },

    // onMinimize: function(){
    //   console.log('LLUREnquiry::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('LLUREnquiry::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('LLUREnquiry::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('LLUREnquiry::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('LLUREnquiry::onPositionChange');
    // },

    // resize: function(){
    //   console.log('LLUREnquiry::resize');
    // }

    //methods to communication between widgets:

  });

});
