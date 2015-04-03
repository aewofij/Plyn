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

define([ 'core/datatypes' ], function (Type) {
  function Signal (type, initialVal, name) {
    this.type = type;
    this.callbacks = {};

    var callbackIdCounter = 0;
    this.nextCallbackId = function () {
      return (++callbackIdCounter).toString();
    };

    if (arguments.length > 1) {
      if (Type.isRefinement(initialVal.type, type)) {
        this.current = initialVal;
        if (arguments.length > 2) {
          this.name = name;
        }
      } else {
        // TODO: better error
        throw new Error('Failed typecheck');
      }
    }
  }

  // Pushes `newValue` to be the next value of `sig`.
  function push (sig, newValue) {
    if (Type.isRefinement(newValue.type, sig.type)) {
      sig.current = newValue;
      didUpdate(sig);
    } else {
      throw new Error('Failed typecheck');
    }
  }

  /* Adds a new callback to a `Signal`'s list of callbacks,
   *   to be called on update, and returns an identifier for
   *   the registered callback.
   *
   * sig      : the `Signal` to which we are subscribing
   * callback : a function to be called when `sig` is updated.
   * returns  : an identifier for the callback, for use with `unsubscribe`
   *
   * The updated value of `sig` will be passed to `callback`
   *   on each update.
   */
  function subscribe (sig, callback) {
    var id = sig.nextCallbackId();
    sig.callbacks[id] = callback;
    return id;
  }

  /* Removes the callback associated with the provided identifier
   *   from the provided `Signal`'s list of callbacks.
   *
   * sig : the signal from which we want to unsubscribe
   * id  : the identifier of the callback to be removed
   */
  function unsubscribe (sig, id) {
    delete sig.callbacks[id];
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
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    reflect: reflect
  };
});