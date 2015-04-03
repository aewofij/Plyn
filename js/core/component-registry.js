/*
Keeps a database of components which can be instantiated by the user.
*/

define([ 'core/components'
       , 'core/obj'
       , 'modules/geometry'
       , 'modules/mouse'
       , 'modules/ramp' 
       , 'modules/rigidbody'
       , 'modules/time' 
       , 'modules/transform' ],
       function (Component, Obj,
                 Geometry, Mouse, Ramp, 
                 Rigidbody, Time, Transform) {

  var typeToComponent = {};
  var sampleObj = new Obj('sample');
  function registerComponent (component) {
    var sample = new component(sampleObj);
    typeToComponent[sample.componentType] = component.prototype.constructor;
  }

  [Geometry, Mouse, Ramp, Rigidbody, Time, Transform].map(registerComponent);

  function makeComponentCons (type) {
    var cons = (typeToComponent[type]);
    if (cons === undefined) {
      throw new Error('no such component', type);
    } else {
      return cons;
    }
  }

  return {
    makeComponentCons: makeComponentCons
  };
});