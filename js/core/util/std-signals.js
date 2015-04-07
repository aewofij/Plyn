define([ 'core/signals'
       , 'core/data'
       , 'core/datatypes' ], 
       function (Signal, Data, Type) {


  function clock (periodInMs) {
    var result = Signal.Signal(Type.Number, 
                               Data.Number (0), 
                               'clock' + periodInMs);

    var step = 0;

    window.setInterval(function () {
      Signal.push(result, Data.Number (++step));
    }, periodInMs);

    return result;
  }


  return {
    clock: clock
  };
});