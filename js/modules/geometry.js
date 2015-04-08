/*
`Component` for rectangle and circle geometries.
*/

define([ 'core/components'
       , 'core/signals'
       , 'core/actions'
       , 'core/datatypes' 
       , 'core/data' 
       , 'util/vector3'
       , 'physicsjs'
       , 'physicsjs/bodies/rectangle'
       , 'physicsjs/geometries/rectangle' ], 
                    function (Component, 
                              Signal, 
                              Action,
                              Datatype,
                              Data,
                              Vector3,
                              Physics) {
  RectGeometry.prototype.componentType = 'RectGeometry';
  var requirements = [];

  function RectGeometry (ownerObj) {
    // call super
    Component.call(this, ownerObj);

    this.requirements.concat(requirements);

    this.signals[this.componentType] = {
      width: new Signal.Signal(Datatype.Number,
                               Data.Number (50)),
      height: new Signal.Signal(Datatype.Number,
                                Data.Number (50))
    };

    this.actions[this.componentType] = {};


    // ---- Modify backing object ---- //

    ownerObj.body.components[this.componentType] = this;

    ownerObj.body.geometry = Physics.geometry('rectangle', {
      width: this.signals[this.componentType].width.current.val,
      height: this.signals[this.componentType].height.current.val
    });

    // bind signals to backing object
    // TODO: these don't seem to be reflecting in the render...
    Signal.subscribe(this.signals[this.componentType].width, function (v) {
      ownerObj.body.geometry.options({ width: v.val});
    });

    Signal.subscribe(this.signals[this.componentType].height, function (v) {
      ownerObj.body.geometry.options({ height: v.val});
    });
  }

  CircleGeometry.prototype.componentType = 'CircleGeometry';
  var requirements = [];

  function CircleGeometry (ownerObj) {
    // call super
    Component.call(this, ownerObj);

    this.requirements.concat(requirements);

    this.signals[this.componentType] = {
      radius: new Signal.Signal(Datatype.Number,
                                Data.Number (25)),
    };

    this.actions[this.componentType] = {};


    // ---- Modify backing object ---- //

    ownerObj.body.components[this.componentType] = this;

    ownerObj.body.geometry = Physics.geometry('circle', {
      radius: this.signals[this.componentType].radius.current.val
    });

    // bind signals to backing object
    Signal.subscribe(this.signals[this.componentType].radius, function (v) {
      ownerObj.body.geometry.options({ radius: v.val });
    });
  }

  return {
    Rectangle: RectGeometry,
    Circle: CircleGeometry
  };
}); 