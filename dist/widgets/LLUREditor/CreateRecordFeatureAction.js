define(['dojo/_base/declare', 'jimu/BaseFeatureAction', 'jimu/WidgetManager'], function (declare, BaseFeatureAction, WidgetManager) {
  var clazz = declare(BaseFeatureAction, {
    iconFormat: 'png',

    isFeatureSupported: function isFeatureSupported(featureSet) {
      return featureSet.features.length > 0 && featureSet.features[0].geometry.type !== 'point';
    },

    onExecute: function onExecute(featureSet) {
      WidgetManager.getInstance().triggerWidgetOpen(this.widgetId).then(function (myWidget) {
        alert('Test!');
        // myWidget.showVertexCount(vertexCount);
      });
    }

  });
  return clazz;
});
