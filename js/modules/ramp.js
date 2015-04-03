/*
`Component` for signal ramping.
*/

define([ 'core/components'
       , 'core/signals' ], function (Component, Signal) {
  var typeString = 'Ramp';
  var requirements = [ 'Time' ];
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

  function Ramp (ownerObj) {
    Component.call(this, ownerObj, typeString);

    this.requirements.concat(requirements);
    this.signals[this.componentType] = signals;
    this.actions[this.componentType] = actions;
  }

  return Ramp;
}); 