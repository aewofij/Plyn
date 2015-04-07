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
       , 'bacon' ], function (Type, Bacon) {
  // TODO: make this not use new
  function Signal (type, initialVal, name) {
    if (!(this instanceof Signal)) return new Signal(type, initialVal, name);

    this.type = type;
    this.callbacks = {};

    this.id = nextSignalId();

    var callbackIdCounter = 0;
    this.nextCallbackId = function () {
      return (++callbackIdCounter).toString();
    };

    this.bus = new Bacon.Bus();
    this.busUnsub = this.bus.subscribe((function (incoming) {
      this.current = incoming.value();
    }).bind(this));

    if (initialVal !== undefined) {
      if (Type.isRefinement(initialVal.type, type)) {
        push(this, initialVal);
        if (name !== undefined) {
          this.name = name;
        }
      } else {
        // TODO: better error
        throw new Error('Failed typecheck');
      }
    }
  }
  
  var signalIdCounter = 0;
  function nextSignalId () {
    return ('Signal' + signalIdCounter++);
  }

  // Pushes `newValue` to be the next value of `sig`.
  function push (sig, newValue) {
    if (Type.isRefinement(newValue.type, sig.type)) {
      var next = new Bacon.Next(newValue);
      sig.bus.push(next);
      didUpdate(sig);
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
    var unsub = sig.bus.subscribe(function (evt) {
      // TODO: deal with Bacon.End
      return callback(evt.value());
    });
    return unsub;
  }

  // Sets this `ontoSig` to reflect value of `reflectedSig`.
  // TODO: make reversable
  function reflect (ontoSig, reflectedSig) {
    // When `reflectedSig` updates, push the updated value
    //   into `ontoSig`.
    subscribe(reflectedSig, function (v) {
      push(ontoSig, v);
    });
  }

  // ----- Helper functions ----- //

  // Called when `sig`'s value is updated.
  function didUpdate (sig) {
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