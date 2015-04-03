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
  var typeString = 'Mouse';
  var requirements = [];

  function Mouse (ownerObj) {
    Component.call(this, ownerObj, typeString);

    this.requirements.concat(requirements);

    this.signals[this.componentType] = {
      position: new Signal.Signal(Vector2.type, 
                                  Data.Record (Vector2.type) 
                                              (Data.Number (0))
                                              (Data.Number (0))),
      down: new Signal.Signal(Type.Boolean,
                              Data.Boolean (false))
    };

    this.actions[this.componentType] = {};


    // Set up signals.

    var self = this;

    document.onmousemove = function (evt) {
      if (DLGlobals.sceneViewport !== undefined) {
        var rect = DLGlobals.sceneViewport.getBoundingClientRect();

        withPointInRect({x: evt.pageX, y: evt.pageY}, rect, function (scaled) {
          Signal.push(self.signals[self.componentType].position,
                      Vector2.Vector2 (Data.Number (scaled.x)) (Data.Number (scaled.y)));
        });
      }
    }

    document.onmousedown = function (evt) {
      // if we have a scene,
      if (DLGlobals.sceneViewport !== undefined) {
        // then only push when the mouse is inside the scene.
        var rect = DLGlobals.sceneViewport.getBoundingClientRect();

        if (ptIsInRect({x: evt.pageX, y: evt.pageY}, rect)) {
          Signal.push(self.signals[self.componentType].down, 
                      Data.Boolean (true));
        }
      } else {
        Signal.push(self.signals[self.componentType].down, 
                    Data.Boolean (true));
      }
    }

    document.onmouseup = function (evt) {
      Signal.push(self.signals[self.componentType].down, 
                  Data.Boolean (false));
    }


    // ---- Modifying backing object ---- //
    ownerObj.body.components[this.componentType] = this;
  }

  function ptIsInRect (pt, rect) {
    return (pt.x > rect.left)
        && (pt.x < rect.right)
        && (pt.y > rect.top)
        && (pt.y < rect.bottom);
  }

  function withPointInRect(pt, rect, proc) {
    var scaled = { x: pt.x - rect.left, y: pt.y - rect.top };
    return proc(scaled);
  }

  return Mouse;
}); 