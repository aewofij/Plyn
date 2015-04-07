/*
A `Signal` is a container for data which changes over time.

[`a` is a `Type`.]
Signal a : { type : a
           , callbacks : [Function]
           , nextCallbackId : () -> string
           , current : a
           , name : string }

TODO: make push asynchronous, all signals update on change in clock signal?
*/

define([ 'core/datatypes'
       , 'core/data'
       , 'underscore' ], function (Type, Data, _) {
  function Signal (type, initialVal, name) {
    if (!(this instanceof Signal)) return new Signal(type, initialVal, name);

    this.type = type;
    this.callbacks = {};

    this.id = nextSignalId();

    // `buffer` holds changes which this signal is waiting to perform, 
    //   with most recent changes at end of list.
    this.buffer = [];

    var callbackIdCounter = 0;
    this.nextCallbackId = function () {
      return (++callbackIdCounter).toString();
    };

    if (initialVal !== undefined) {
      if (Type.isRefinement(initialVal.type, type)) {
        // push(this, initialVal);
        this.current = initialVal;
        if (name !== undefined) {
          this.name = name;
        }
      } else {
        // TODO: better error
        throw new Error('Failed typecheck');
      }
    } 
    else {
      this.current = defaultValue(type);
    }
  }

  var signalIdCounter = 0;
  function nextSignalId () {
    return ('Signal' + signalIdCounter++);
  }

  function defaultValue (type) {
    if (Type.isRefinement(type, Type.Number)) {
      return Data.Number (0);
    } else if (Type.isRefinement(type, Type.Boolean)) {
      return Data.Boolean (false);
    } else if (Type.isRefinement(type, Type.String)) {
      return Data.String ("");
    } else if (type.hasOwnProperty('fields')) {
      var cons = Data.Record (type);
      return _.reduce(type.fields, function (acc, fld) {
        return acc(defaultValue(fld.type));
      }, cons);
    } 
  }

  // Queue of signal IDs awaiting value updates; most recent change is at end of list.
  var updated = [];

  // Maps signal IDs to a list of a push queue, with most recent at end of queue.
  var valueBuffer = {};

  // Pushes `newValue` to be the next value of `sig`.
  function push (sig, newValue) {
    if (Type.isRefinement(newValue.type, sig.type)) {
      // sig.buffer.push(newValue);
      if (valueBuffer[sig.id] === undefined) {
        valueBuffer[sig.id] = [];
      } 
      valueBuffer[sig.id].push(newValue);

      updated.push(sig);
    } else {
      throw new Error('Failed typecheck');
    }
  }

  // Pulls current value from `sig`.
  function pull (sig) {
    return sig.current;
  }

  /* Adds a new callback to a `Signal`'s list of callbacks,
   *   to be called on update, and returns an identifier for
   *   the registered callback.
   *
   * sig      : the `Signal` to which we are subscribing
   * callback : a function to be called when `sig` is updated.
   * returns  : an unsubscribe function - removes subscription when called
   *
   * The updated value of `sig` will be passed to `callback`
   *   on each update, in its 'boxed' form.
   */
  function subscribe (sig, callback) {
    var cbId = sig.nextCallbackId();
    sig.callbacks[cbId] = callback;

    return function () {
      delete sig.callbacks[cbId];
    }
  }

  // Sets this `ontoSig` to reflect value of `reflectedSig`.
  // TODO: make reversable
  function reflect (ontoSig, reflectedSig) {
    // When `reflectedSig` updates, push the updated value
    //   into `ontoSig`.
    return subscribe(reflectedSig, function (v) {
      push(ontoSig, v);
    });
  }

  var running = true;

  // ----- Helper functions ----- //

  function flushUpdated () {
    console.log('num updates', updated.length);

    // DEBUG: auto exit
    if (updated.length > 2000) {
      running = false;
    }

    // Make a copy of `updated` and `valueBuffer` so that we have a fixed-size queue.
    var updatedCopy = updated.slice();
    // Immediately clear `updated`, so that it can receive
    //   any new updates resulting from the flush.
    updated = []; 

    //// ----- FOR "LAZY" VERSION
    // // Copy and clear valueBuffer.
    // var valueBufferCopy = _.mapObject(valueBuffer, function (val, key) { 
    //   var r = val.slice();
    //   delete valueBuffer[key];
    //   return r;
    // });
    var valueBufferCopy = valueBuffer;

    _.each(updatedCopy, function (sig) {
      //// ----- FOR "LAZY" VERSION (instead of below)
      // if (valueBufferCopy[sig.id] !== undefined) {
        // if (valueBufferCopy[sig.id].length > 1) {
        //   // haven't arrived at most recent value
        //   // so just pop and skip
        //   valueBufferCopy[sig.id].shift();
        // } else if (valueBufferCopy[sig.id].length < 1) {
        //   // bad!
        //   console.log('ran out of buffer', sig.id);
        // } else {
        //   sig.current = valueBufferCopy[sig.id][0];
        //   delete valueBufferCopy[sig.id];
        //   performCallbacks(sig);
        // }
      // }

      if (valueBufferCopy[sig.id].length > 0) {
        var next = valueBufferCopy[sig.id].shift();
        valueBufferCopy[sig.id] = [];
        if (sig.current !== next) {
          sig.current = next;
          performCallbacks(sig);
        }
      }

    });

    if (running) {
      window.requestAnimationFrame(flushUpdated);
    }
  }

  window.requestAnimationFrame(flushUpdated);

  function performCallbacks (sig) {
    Object.keys(sig.callbacks).forEach(function (id) {
      sig.callbacks[id](sig.current);
    }); 
  }

  // ----- RequireJS exports ----- //

  return {
    Signal: Signal,
    push: push,
    pull: pull,
    subscribe: subscribe,
    reflect: reflect
  };
});