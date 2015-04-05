/*
Describes a function from Signal a [x Signal a_1 x ...] -> Signal b.
*/

define([ 'core/datatypes'
       , 'core/data' 
       , 'core/signals' 
       , 'util/objutil'
       , 'util/listutil' ], 
       function (Type, Data, Signal, ObjUtil, ListUtil) {
  /* Constructs an `Arrow` signal function.
   *
   * inputTypes : [ Type ]
   * returnType : Type
   * plug : [<input>] -> { signal: Signal <ReturnType>, unplug: Function }
   */
  function Arrow () {}

  Arrow.prototype = Object.create(Object.prototype, {
    /* name : String
     * Name (or "kind") of this `Arrow`. Nonunique, should describe what the arrow does.
     */
    name: {
      enumerable: true,
      value: null
    },

    /* parameters : [{type: ParameterType, 
                      value: <parameter data>, 
                      [changed: <function to call on value changed>]}]
     * Parameters for this Arrow. 
     * Example: for a `pushTo` arrow, which signal to push onto.
     */
    parameters: {
      enumerable: true,
      value: null
    },

    /* inputTypes : [Type]
     * Array of expected types of inputs, ordered by inlet index.
     */
    inputTypes: {
      enumerable: true,
      writable: true,
      value: null
    },

    /* returnType : Type
     * (Super)type of signal created by this arrow.
     */
    returnType: {
      enumerable: true,
      writable: true,
      value: null
    },

    /* plug : Signal [-> Signal -> ...] -> ArrowInstance
     * Procedure to "plug" inputs and create a new instance of this arrow.
     */
    plug: {
      enumerable: true,
      value: null
    },


    /* setParameter : String -> <new value of corresponding parameter>
     * Sets the specified parameter for this Arrow, 
     *   calling the parameter's `changed` function if present.
     */
    setParameter: {
      enumerable: true,
      value: function (paramId, newValue) {
        var param = this.parameters[paramId];
        if (param !== null) {
          // TODO: check type?
          var oldValue = param.value;

          // set value
          param.value = newValue;

          // if parameter has a `changed` function, run it
          if (param['changed'] !== undefined) {
            param['changed'].call(this, oldValue, newValue, this);
          }
        }
        return this;
      }
    },
  });

  // The result of plugging an arrow, containing the new calculated signal,
  //   a function to unplug (remove) this instance, and a list of this instance's inputs.
  function ArrowInstance (signal, unplug, inputs, pull) {
    return Object.create(ArrowInstance.prototype, {
      signal: {
        enumerable: true,
        value: signal
      },
      unplug: {
        enumerable: true,
        value: unplug
      },
      inputs: {
        enumerable: true,
        value: inputs
      },

      // function which forces a new calculation
      pull: {
        enumerable: true,
        value: pull
      }
    });
  }

  ArrowInstance.prototype = Object.create(Object.prototype, {
    signal: {
      enumerable: true,
      value: null
    },
    unplug: {
      enumerable: true,
      value: null
    },
    inputs: {
      enumerable: true,
      value: null
    },
    pull: {
      enumerable: true,
      value: null
    },
  });

  /* Create an arrow with an event handler paradigm.
   *
   * inputTypes : array of expected types of signal inputs
   * parameters : array of parameters for this arrow, 
   *              in form { type: <parameter type>, value: <initial value> }
   * returnType : expected type of calculated signal
   * eventHandler : inputTypes[0] [-> inputTypes[1] -> ...] -> returnType
   * signalSetup : Signal returnType -> [Signal inputType] -> void
   *
   * If a `signalSetup` procedure is supplied, it is run before returning
   *   the new `ArrowInstance`. 
   * If no `signalSetup` is supplied, the `Arrow`'s default behavior is performed, 
   *   pulling the most recent values from the plugged inputs.
   */
  function EventArrow (name, parameters, inputTypes, 
                       returnType, eventHandler, signalSetup) {
    return Object.create(Arrow.prototype, {
      name: {
        enumerable: true,
        value: name
      },

      /* parameters : [{type: ParameterType, value: <parameter value>}]
       * Parameters for this Arrow. 
       * Example: for a `pushTo` arrow, which signal to push onto.
       */
      parameters: {
        enumerable: true,
        value: parameters
      },

      inputTypes: {
        enumerable: true,
        writable: true,
        value: inputTypes
        // get: function () { 
        //   return ((inputTypes instanceof Function) 
        //           ? inputTypes.call(this)
        //           : inputTypes) 
        // }
      },

      returnType: {
        enumerable: true,
        writable: true,
        value: returnType
        // get: function () { 
        //   return ((returnType instanceof Function) 
        //           ? returnType.call(this) 
        //           : returnType) 
        // }
      },

      plug: {
        enumerable: true,
        value: function () {
          var inputs = Array.prototype.slice.call(arguments);
          var arrow = this;

          var resultSignal = checkPlug(arrow, inputs);

          // setup callbacks
          var cb = (function () {
                      var resultValue = eventHandler.apply(arrow, 
                                                           inputs.map(Signal.pull));
                      // this checks allows the handler to not return 
                      //   in order to skip updating result signal
                      if (resultValue !== undefined) {
                        if (Type.isRefinement(resultValue.type, this.returnType)) {
                          Signal.push(resultSignal, 
                                      resultValue);
                        } else {
                          throw {
                            message: 'Return value from arrow did not match specified type.',
                            arrow: arrow,
                            expected: returnType,
                            actual: resultValue.type,
                            toString: function () {
                              return message + '\n\tExpected: ' + this.expected 
                                   + '\n\tActual: ' + this.actual;
                            }
                          }
                        }
                      } 
                    }).bind(this);

          var callbacks = [];
          for (var i = arrow.inputTypes.length - 1; i >= 0; i--) {
            callbacks.push(Signal.subscribe(inputs[i], cb));
          };

          var unsubFn = function () {
            callbacks.forEach(function (unsub) { unsub() });
          }

          if (signalSetup !== undefined) {
            signalSetup.call(this, resultSignal, inputs);
          }

          var pull = cb;

          return ArrowInstance(resultSignal, unsubFn, inputs, pull);
        }
      }
    });
  }

  /* Create an arrow with a signal transformation or subscription paradigm.
   * 
   */
  function SignalArrow (name, parameters, inputTypes, returnType, subscriptions) {
    return Object.create(Arrow.prototype, {
      name: {
        enumerable: true,
        value: name
      },

      /* parameters : [{type: ParameterType, value: <parameter value>}]
       * Parameters for this Arrow. 
       * Example: for a `pushTo` arrow, which signal to push onto.
       */
      parameters: {
        enumerable: true,
        value: parameters
      },

      inputTypes: {
        enumerable: true,
        writable: true,
        value: inputTypes
        // get: function () { 
        //   return ((inputTypes instanceof Function) 
        //           ? inputTypes.call(this) 
        //           : inputTypes) 
        // }
      },

      returnType: {
        enumerable: true,
        writable: true,
        value: returnType
        // get: function () { 
        //   return ((returnType instanceof Function) 
        //           ? returnType.call(this) 
        //           : returnType) 
        // }
      },
      
      plug: {
        enumerable: true,
        value: function () {
          var inputs = Array.prototype.slice.call(arguments);
          var resultSignal = checkPlug(this, inputs);

          var unplugs = subscriptions.reduce(function (prev, subToInput, idx) {
            return prev.concat(subToInput.map(function (sub) {
              return Signal.subscribe(inputs[idx], function (v) {
                return sub(resultSignal, v);
              });
            }));
          }, []);

          // var unplugs = setupFunction.apply(this, [resultSignal].concat(inputs));
          var unsubFn = function () {
            unplugs.forEach(function (elm) { elm() });
          };


          var pull = function () {
            inputs.forEach(function (sig, idx) {
              subscriptions[idx].forEach(function (sub) {
                sub(resultSignal, Signal.pull(sig));
              });
            });
          }

          return ArrowInstance(resultSignal, unsubFn, inputs, pull);
        }
      }
    });
  }

  /* Creates an arrow with no inputs, which simply outputs a signal.
   */
  function OutputArrow () {
    return Object.create(Arrow.prototype, {
      name: {
        enumerable: true,
        value: 'signal'
      },
      parameters: {
        enumerable: true,
        value: { signal: {type: ParameterType.signal, value: null} }
      }, 
      inputTypes: {
        enumerable: true,
        writable: true,
        value: []
      },
      returnType: {
        enumerable: true,
        get: function () { return this.parameters.signal.value.type }
      },
      plug: {
        enumerable: true,
        value: function () {
          return ArrowInstance(this.parameters.signal.value, 
                               function () {}, 
                               [], 
                               function () { return Signal.pull(this.parameters.signal.value) });
        }
      }
    });
  }

  // All types of Arrow parameters.
  var ParameterType = {
    signal: 'signal',
    script: 'script',
    type: 'type',
  }

  function checkPlug (arrow, inputs) {
    // make sure the arrow has types
    var validType = function (ty) { return ty !== null && ty !== undefined };
    if (!_.every(arrow.inputTypes, function (elm) { return validType(elm) })
        || !validType(arrow.returnType)) {
      throw {
        message: 'Types not defined.' 
                  + '\n\tInputs: ' + _.map(arrow.inputTypes, function (elm) { 
                                      return validType(elm) ? elm.category : '<invalid>'  
                                    })
                  + '\n\tOutput: ' + (validType(arrow.returnType) 
                                     ? arrow.returnType.category 
                                     : '<invalid>')
      };
    }

    // check parity
    if (arrow.inputTypes.length !== inputs.length) {
      throw {
        message: 'Mismatched parity.',
        arrow: arrow,
        inputs: inputs,
        expected: arrow.inputTypes.length,
        actual: inputs.length,
        toString: function () {
          return message + '\n\tExpected: ' + this.expected 
                         + '\n\tActual: ' + this.actual;
        }
      };
    }

    // type-check arguments
    var expectedTypes = arrow.inputTypes;
    var actualTypes = inputs.map(ObjUtil.field('type'));

    var constraints = ListUtil.map2(actualTypes, expectedTypes, Type.refined);
    var solution = Type.solve(constraints);

    if (!solution.checks) {
      throw {
        message: 'Mismatched types.',
        arrow: arrow,
        inputs: inputs,
        expected: expectedTypes,
        actual: actualTypes,
        toString: function () {
          return this.message + '\n\tExpected: ' + this.expected 
                       + '\n\tActual: ' + this.actual;
        }
      };
    }

    // if return type is a variable, look it up in the solution
    // FIXME: this is a shaky way of checking if type variable...
    var returnType = solution.get(arrow.returnType);

    // create return signal
    return new Signal.Signal(returnType);
  }

  return {
    Arrow: Arrow,
    EventArrow: EventArrow,
    SignalArrow: SignalArrow,
    OutputArrow: OutputArrow,
    ParameterType: ParameterType
  };
});