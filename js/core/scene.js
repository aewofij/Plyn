/*
Defines the state of a "scene" document/program.
A `Scene` is a collection of `Obj`s, with some extra workspace data.
*/
define([ 'core/obj'
       , 'core/component-registry'
       , 'core/behavior/behavior'
       , 'util/objutil' ], 
       function (Obj, ComponentRegistry, Behavior, ObjUtil) {
  // Create a new Scene.
  function Scene () {
    if (!(this instanceof Scene)) return new Scene();

    var idCount = 0;
    this.nextId = function () {
      return '' + idCount++;
    }
  }

  Scene.prototype = Object.create(Object.prototype, {
    objects: {
      value: [],
      writable: true,
      enumerable: true
    },

    behaviors: {
      value: {},
      writable: true,
      enumerable: true
    },

    // Adds an empty `Obj` to the scene, and returns that `Obj`.
    addObject: {
      value: function (objName) {
               var id = this.nextId();
               var newObj = new Obj(objName === undefined ? 'New object ' + id : objName);
               this.objects.push(newObj);
               return newObj;
             }
    },

    // Adds the specified `Behavior` to the scene, and returns a 
    //   function which removes that `Behavior` from the scene.
    addBehavior: {
      value: function (beh) {
               var id = 'behavior' + this.nextId();
               this.behaviors[id] = beh;
 
               var self = this;
               return function () {
                 delete self.behaviors[id];
               }
             }
    }
  });

  function serialize (scene) {
    return {
      objects: scene.objects.map(function (obj) {
        return {
          name: obj.name,
          components: ObjUtil.objMap(obj.components, function (k, elm) { return elm.serialize() })
        };
      }),

      behaviors: ObjUtil.objMap(scene.behaviors, function (id, beh) {
        return Behavior.serialize(beh);
      })
    }
  }

  function parse (data) {
    var result = new Scene();

    result.objects = data.objects.map(function (elm) {
      var result = new Obj(elm.name);
      result.addComponent.apply(result, ObjUtil.values(elm.components).map(function (comp) {
        return ComponentRegistry.makeComponentCons(comp.type)(result);
      }));
    });

    result.behaviors = ObjUtil.objMap(data.behaviors, function(k,v) { return Behavior.parse(v) });

    return result;
  }

  return {
    Scene: Scene,
    serialize: serialize,
    parse: parse
  };
});