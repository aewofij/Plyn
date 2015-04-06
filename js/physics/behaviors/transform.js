/*
Behavior for PhysicsJS which interacts with the Transform component.
*/
define([ 'core/data'
       , 'core/datatypes'
       , 'core/signals'
       , 'util/vector2'
       , 'physicsjs' ], function (Data, Datatype, Signal, Vector2, Physics) {
  Physics.behavior('transform', function (parent) {
    return {
      // extended
      init: function (options){
        parent.init.call(this);
        this.options(options);
      },

      // extended
      behave: function(data) {
        var bodies = this.getTargets();

        for (var i = 0, l = bodies.length; i < l; ++i){
          if (bodies[i].hasOwnProperty('components') && bodies[i].components['Transform'] !== undefined) {
            var xform = bodies[i].components['Transform'];

            // TODO: maybe do two-way repetition filter? 
            // (currently one-way, on component side)

            var currentModelPos = {
              x: xform.signals.Transform.position.current.val.x.val,
              y: xform.signals.Transform.position.current.val.y.val
            };

            var currentPhysicsPos = {
              x: bodies[i].state.pos.x,
              y: bodies[i].state.pos.y
            };

            bodies[i].state.pos.x = currentModelPos.x;
            bodies[i].state.pos.y = currentModelPos.y;

            if (currentModelPos.x !== currentPhysicsPos.x || currentModelPos.y !== currentPhysicsPos.y) {
              var posVec = Vector2.Vector2 (Data.Number (currentPhysicsPos.x)) 
                                           (Data.Number (currentPhysicsPos.y));
              Signal.push(xform.signals['Transform'].position, posVec);
            }

          }
        }
      }
    };
  });
});