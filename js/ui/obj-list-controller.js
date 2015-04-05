/*
Controls a view into the set of all Plyn objects.
*/

define([ 'underscore' ], 
       function (_) {

  function ObjListController (theScene) {
    var self = this;

    this.scene = theScene;

    this.updateObjectList();
    // Object.observe(this.scene.objects, this.updateObjectList);
  }

  ObjListController.prototype = {

    scene: null,

    allObjects: [],

    addObject: function () {
      var result = this.scene.addObject();
      this.updateObjectList();
      return result;
    },

    addComponent: function (componentCons, onObj) {
      new componentCons(onObj);
      this.updateObjectList();
    },

    updateObjectList: function () {
      // this.allObjects = _.values(this.scene.objects);
      this.allObjects = _.values(this.scene.objects).map(function (obj) {
        return {
          model: obj,
          components: _.keys(obj.components).map(function (compKey) {
            return {
              id: compKey,
              model: obj.components[compKey]
            };
          })
        };
      });
    }

  }

  return ObjListController;
});