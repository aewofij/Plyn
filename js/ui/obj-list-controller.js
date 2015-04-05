/*
Controls a view into the set of all Plyn objects.
*/

define([ 'underscore' ], 
       function (_) {

  function ObjListController (theScene) {
    this.scene = theScene;
    this.updateObjectList();
  }

  ObjListController.prototype = {

    scene: null,

    allObjects: [],

    addObject: function () {
      return this.scene.addObject();
      this.updateObjectList();
    },

    addComponent: function (componentCons, onObj) {
      new componentCons(onObj);
      this.updateObjectList();
    },

    updateObjectList: function () {
      this.allObjects = _.values(this.scene.objects);
    }

  }

  return ObjListController;
});