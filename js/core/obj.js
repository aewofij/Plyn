/*
Container for `Component`s and scripts.
*/

define([ 'physicsjs', 'physics/bodies/objbody' ], function (Physics) {
  // Creates a new `Obj`, given a name.
  function Obj (name) {
    if (!(this instanceof Obj)) return new Obj(name);

    // Create backing PhysicsJS body.
    this.body = Physics.body('obj');
    this.name = name;
    this.components = {};
  }

  Obj.prototype = {
    // user-defined alias for this object
    name: null,

    // Maps component identifier to `Component`.
    components: {},

    // The backing PhysicsJS body.
    body: undefined,

    // Puts `component` into this `Obj`'s dict of `Component`s at key `id`.
    addComponent: function (id, component) {
      this.components[id] = component;
    }
  };

  return Obj;
});