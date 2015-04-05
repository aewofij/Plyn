/*
Controls a view into the set of all Plyn objects.
*/

define([ 'underscore' ], 
       function (_) {

  function ObjListController (theScene) {
    var self = this;

    this.scene = theScene;
    var updateObjectList = function () {
      self.allObjects = _.map(_.values(self.scene.objects), function (obj) {
        return {
          model: obj,
          components: _.map(_.keys(obj.components), function (compKey) {
            return {
              id: compKey,
              component: obj.components[compKey]
            };
          })
        };
      });
    };

    updateObjectList();
    Object.observe(this.scene.objects, updateObjectList);
  }

  ObjListController.prototype = {

    scene: null,

    allObjects: [],

    addObject: function () {
      return this.scene.addObject();
    },

    addComponent: function (componentCons, onObj) {
      new componentCons(onObj);
    }

  }

  return ObjListController;
});