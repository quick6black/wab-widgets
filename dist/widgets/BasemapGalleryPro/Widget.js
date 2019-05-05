define(['dojo/_base/declare', 'jimu/BaseWidget'], function (declare, BaseWidget) {
    //To create a widget, you need to derive from BaseWidget.
    return declare([BaseWidget], {

        // Custom widget code goes here

        baseClass: 'jimu-widget-basemapgallery-pro',
        // this property is set by the framework when widget is loaded.
        // name: 'BasemapGalleryPro',
        // add additional properties here

        //methods to communication with app container:
        postCreate: function postCreate() {
            this.inherited(arguments);
            console.log('BasemapGalleryPro::postCreate');
        }

        // startup: function() {
        //   this.inherited(arguments);
        //   console.log('BasemapGalleryPro::startup');
        // },

        // onOpen: function(){
        //   console.log('BasemapGalleryPro::onOpen');
        // },

        // onClose: function(){
        //   console.log('BasemapGalleryPro::onClose');
        // },

        // onMinimize: function(){
        //   console.log('BasemapGalleryPro::onMinimize');
        // },

        // onMaximize: function(){
        //   console.log('BasemapGalleryPro::onMaximize');
        // },

        // onSignIn: function(credential){
        //   console.log('BasemapGalleryPro::onSignIn', credential);
        // },

        // onSignOut: function(){
        //   console.log('BasemapGalleryPro::onSignOut');
        // }

        // onPositionChange: function(){
        //   console.log('BasemapGalleryPro::onPositionChange');
        // },

        // resize: function(){
        //   console.log('BasemapGalleryPro::resize');
        // }

        //methods to communication between widgets:

    });
});
