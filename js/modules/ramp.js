/*
`Component` for signal ramping.
*/

define([ 'core/components'
       , 'core/signals' ], function (Component, Signal) {
  Ramp.prototype.componentType = 'Ramp';
  var requirements = [ 'Time' ];

  function Ramp (ownerObj) {
    Component.call(this, ownerObj);

    var signals = {
      ramp: new Signal.Signal(0),
      progress: new Signal.Signal(0),
      duration: new Signal.Signal(1000)
    };
    var actions = {
      // start: new Action([], function () {
        
      // }),

      // stop: new Action([], function () {
        
      // })
    };

    this.requirements.concat(requirements);
    this.signals[this.componentType] = signals;
    this.actions[this.componentType] = actions;
  }

  return Ramp;
}); 