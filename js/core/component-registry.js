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

  var constructorsMap = {};
  function registerComponent (component) {
    constructorsMap[component.prototype.componentType] = 
      component.prototype.constructor;
  }

  [Geometry.Rectangle, Geometry.Circle, Mouse, Ramp, Rigidbody, Time, Transform].map(registerComponent);

  function makeComponentCons (type) {
    var cons = (constructorsMap[type]);
    if (cons === undefined) {
      throw new Error('no such component', type);
    } else {
      return cons;
    }
  }

  return {
    makeComponentCons: makeComponentCons,
    allComponents: constructorsMap
  };
});