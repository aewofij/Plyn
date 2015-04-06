/*
`Component` for basic transform capabilities: 
position, rotation, and scale.
*/

define([ 'core/components'
       , 'core/signals'
       , 'core/actions'
       , 'core/datatypes' 
       , 'core/data' 
       , 'util/vector2' ], function (Component, 
                                     Signal, 
                                     Action,
                                     Type,
                                     Data,
                                     Vector2) {
  Transform.prototype.componentType = 'Transform';
  var requirements = [];

  function Transform (ownerObj) {
    Component.call(this, ownerObj);

    var xformThis = this;

    this.requirements.concat(requirements);

    this.signals[this.componentType] = {
      position: new Signal.Signal(Vector2.type, undefined,
                                  'transformposition')

    };

    this.actions[this.componentType] = {
      placeAt: new Action.Action([ Vector2.type ], function (newPosition) {
        Signal.push(xformThis.signals[xformThis.componentType].position, 
                         { type: Vector2.type, val: newPosition });
        // TODO: make injection function for above case? how to do safely? monadic?
      })
    };

    // ---- Modifying backing object ---- //
    ownerObj.body.components[this.componentType] = this;

    Signal.subscribe(this.signals[this.componentType].position, function (v) {
      if (ownerObj.body.state.pos.x !== v.val.x.val) {
        ownerObj.body.state.pos.x = v.val.x.val;
      }
      if (ownerObj.body.state.pos.y !== v.val.y.val) {
        ownerObj.body.state.pos.y = v.val.y.val;
      }
    });

  }

  return Transform;
}); 