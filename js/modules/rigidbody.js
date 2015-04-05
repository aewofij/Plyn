/*
`Component` for basic physics capabilities: 
mass, forces.
*/

// TODO: this one's pretty out of date now

define([ 'core/components'
       , 'core/signals'
       , 'util/vector2' ], function (Component, Signal, Vector2) {
  Rigidbody.prototype.componentType = 'Rigidbody';  
  var requirements = [ 'Transform' ];

  function Rigidbody (ownerObj) {
    Component.call(this, ownerObj);

    var signals = {
      mass: new Signal.Signal(100),
      velocity: new Signal.Signal({x: 0, y: 0, z: 0}),
      force: new Signal.Signal({x: 0, y: 0, z: 0})
    };

    var actions = {
      // applyForce: new Action({
      //   x: Float, 
      //   y: Float, 
      //   z: Float
      // }, function (amountVec) {
      //   force.setValue(Vector2.add(force.val, amountVec));
      // })
    };
    this.requirements.concat(requirements);
    this.signals[this.componentType] = signals;
    this.actions[this.componentType] = actions;
  }

  return Rigidbody;
}); 