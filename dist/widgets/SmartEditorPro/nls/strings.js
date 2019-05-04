define({
  root: ({
    _widgetLabel: "Smart Editor Pro",
    _featureAction_SmartEditor: "Smart Editor Pro",
    _featureAction_CopyFeature: "Copy Feature",
    noEditPrivileges: "Your account does not have permission to create or modify data.",
    widgetActive: "Active",
    widgetNotActive: "Not Active",
    pressStr: "Press ",
    ctrlStr: " CTRL ",
    snapStr: " to enable snapping",
    noAvailableTempaltes: "No available templates",
    editorCache: " - Editor Cache",
    presetFieldAlias: "Field",
    presetValue: "Preset Value",
    usePresetValues: " Use Preset Values (New features only)",
    editGeometry: " Edit Geometry",
    savePromptTitle: "Save feature",
    savePrompt: "Would you like to save the current feature?",
    deletePromptTitle: "Delete feature",
    deletePrompt: "Are you sure you want to delete the selected feature?",
    attachmentLoadingError: "Error uploading attachments",
    attachmentSaveDeleteWarning: "Warning: Changes to attachments are saved automatically",
    autoSaveEdits: "Saves new feature automatically",
    addNewFeature: "Create new feature",
    featureCreationFailedMsg: "Cannot create a new record/feature",
    relatedItemTitle: "Related Table/Layer",
    invalidRelationShipMsg: "Please make sure the primary key field: \'${parentKeyField}\' has a valid value",
    pendingFeatureSaveMsg: "Please save the feature edits before creating a related feature.",
    attachmentsRequiredMsg: "(*) Attachments are required.",
    coordinatePopupTitle : "Move feature to XY location",
    coordinatesSelectTitle : "Coordinate System:",
    mapSpecialReferenceDropdownOption : "Map Spatial Reference",
    latLongDropdownOption : "Latitude/Longitude",
    xAttributeTextBoxLabel :"X-coordinate:",
    yAttributeTextBoxLabel :"Y-coordinate:",
    latitudeTextBoxLabel : "Latitude:",
    longitudeTextBoxLabel : "Longitude:",
    filterEditor:{
      all: "All",
      noAvailableTempaltes: "No available templates",
      searchTemplates: "Search Templates"
    },
    invalidConfiguration: "Widget is either not configured or the layers in the configuration are no longer in the map.  Please open the app in the builder mode and reconfigure the widget.",
    geometryServiceURLNotFoundMSG: "Unable to get Geometry Service URL",
    clearSelection: "Clear",
    refreshAttributes: "Update feature attributes", // displayed as a tooltip on refresh attribute button
    automaticAttributeUpdatesOn: "Auto update feature attributes: ON", // displayed as a tooltip on automatic attribute update on button
    automaticAttributeUpdatesOff: "Auto update feature attributes: OFF", // displayed as a tooltip on automatic attribute update off button
    moveSelectedFeatureToGPS: "Move selected feature to current GPS location", // displayed as a tooltip on current locate button
    moveSelectedFeatureToXY: "Move selected feature to XY location", // displayed as a tooltip on xy coordinate button
    mapNavigationLocked: "Map Navigation: Locked", // displayed as a tooltip on map navigation locked button
    mapNavigationUnLocked: "Map Navigation: Unlocked", // displayed as a tooltip on map navigation unlocked button
    copyFeatures: {
      title: "Copy Features",
      createFeatures: "Create Features",
      createSingleFeature: "Create 1 Multi-Geometry Feature",
      noFeaturesSelectedMessage: "No Features Selected",
      selectFeatureToCopyMessage: "Please select features to copy."
    },
    addingFeatureError: "Error while adding selected features in the layer. Please try again.", // error message while adding features
    addingFeatureErrorCount: "\'${copyFeatureErrorCount}\' features failed to be copied.", // displayed when few/all the features gets failed to be copied
    selectingFeatureError: "Error while selecting features in the layer. Please try again.", // error message while selecting features
    customSelectOptionLabel: "Select features to copy", // displayed as a label for custom select tool
    noFeatureSelectedMessage: "No features selected.", // Displayed when no features are selected while using custom select tool
    multipleFeatureSaveMessage: "All the features will be saved immediately. Do you want to proceed?",

    copyFeaturesPopup: {
      ok: "OK",
      cancel: "Cancel",
      titleLabel: "Copy Features to Editable Layer",
      templatePickerLabel: "Select a Feature type",
      multipleFeaturesMessage: "Multiple features have been selected to be copied.  In this situation you cannot alter the field details prior to saving to the target layer."
    },

    mergeFeaturesPopup: {
      ok: "OK",
      cancel: "Cancel",
      titleLabel: "Merge Selected Features"
    },

    explodeFeaturesPopup: {
      ok: "OK",
      cancel: "Cancel",
      titleLabel: "Explode Selected Feature"
    },  
    
    tools: {
      mergeFeatures: "Merge",
      mergeToolTitle: "Merge Multiple Features",
      mergeErrors: {
        multipleLayersError: "Merging features can only be performed on the features from one layer.",
        unsupportedGeometryError: "Merging is only available on line and polygon features.",
        numberOfFeaturesError: "A minimum of two features must be selected before merge tool can be used.",
        generalError: "The merge tool is disabled."
      },
      
      explodeMultipartFeatures: "Explode",
      explodeToolTitle: "Explode Multipart Feature",
      explodeErrors: {
        unsupportedGeometryError: "Exploding is only available on line and polygon features.",
        notMultipartError: "The current feature does not have multipart geometry.",
        generalError: "The explode tool is disbaled."
      },

      cutFeatures: "Cut",
      cutToolTitle: "Cut Feature into Parts",
      cutErrors: {
        invalidCutGeometryError: "There was a problem with the shape drawn to cut the selected feature.",
        noFeaturesCutError: "The shape drawn did not intersect the selected feature.",
        unsupportedGeometryError: "Cut is only available on line and polygon features.",
        generalError: "The cut tool is disabled."
      },
    }  

  })
});