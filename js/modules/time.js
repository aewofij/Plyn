/*
`Component` for tracking the flow of time.
*/

define([ 'core/components'
       , 'core/signals'
       , 'core/data'
       , 'core/datatypes' ], 
       function (Component, Signal, Data, Type) {
  var typeString = 'Time';

  function Time (ownerObj, interval) {
    Component.call(this, ownerObj, typeString);

    this.start = Date.now();

    this.requirements.concat([]);
    this.signals[this.componentType] = {
      current: new Signal.Signal(Type.Number, Data.Number (0))
    };
    this.actions[this.componentType] = {};

    setInterval((function () {
      Signal.push(this.signals[this.componentType].current, 
                       Data.Number (Date.now() - this.start));
    }).bind(this), interval);
  }

  return Time;
}); 