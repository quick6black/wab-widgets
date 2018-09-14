define(['dojo/_base/declare', 'jimu/BaseWidget'],
function(declare, BaseWidget) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'llur-editor',
    // this property is set by the framework when widget is loaded.
    // name: 'LLUREditor',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('LLUREditor::postCreate');
    }

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('LLUREditor::startup');
    // },

    // onOpen: function(){
    //   console.log('LLUREditor::onOpen');
    // },

    // onClose: function(){
    //   console.log('LLUREditor::onClose');
    // },

    // onMinimize: function(){
    //   console.log('LLUREditor::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('LLUREditor::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('LLUREditor::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('LLUREditor::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('LLUREditor::onPositionChange');
    // },

    // resize: function(){
    //   console.log('LLUREditor::resize');
    // }

    //methods to communication between widgets:

  });

});
