/*
Defines standard operations for working with signals.
*/

define([ 'core/arrow'
       , 'core/datatypes'
       , 'core/data'
       , 'core/signals'
       , 'core/util/std-signals'
       , 'util/objutil'
       , 'util/vector2' ], 
       function (Arrow, Type, Data, Signal, StdSignals, ObjUtil, Vector2) {


  /* Creates an arrow with no inputs, which simply outputs a signal.
   */
  function outputArrow () {
    var result = Object.create(Arrow.Arrow.prototype, {
      name: {
        enumerable: true,
        value: 'signal'
      },
      parameters: {
        enumerable: true,
        value: { signal: {type: Arrow.ParameterType.signal, value: null} }
      }, 
      inputTypes: {
        enumerable: true,
        writable: true,
        value: []
      },
      returnType: {
        enumerable: true,
        get: function () { return this.parameters.signal.value != null
                                  ? this.parameters.signal.value.type
                                  : Type.Variable('a') }
      },
      plug: {
        enumerable: true,
        value: function () {
          var self = this;
          return Arrow.ArrowInstance(this.parameters.signal.value,
                                     function () {}, 
                                     [], 
                                     function () { return Signal.pull(this.parameters.signal.value) });
        }
      }
    });

    return result;
  }

  function numberExpression () {
    return Arrow.EventArrow('number expression',
                            { expression: { type: Arrow.ParameterType.script, value: null,
                                            changed: function (oldValue, newValue, arro) {
                                              // modify in-place for watchers
                                              arro.inputTypes.splice(0, arro.inputTypes.length); 
                                              if (newValue !== null) {
                                                for (var i = 0; i < newValue.length; i++) {
                                                  arro.inputTypes.push(Type.Number);
                                                };
                                              }
                                            } }},
                            [], 
                            Type.Number,
                            function () {
                              var inArray = Array.prototype.slice.call(arguments);
                              if (inArray.every(function (elm) { 
                                return Type.isRefinement(elm.type, Type.Number)
                              })) {
                                var unboxed = inArray.map(ObjUtil.field('val'));

                                if (this.parameters['expression'].value !== null) {
                                  return Data.Number (this.parameters.expression.value.apply(this, unboxed));
                                }
                              }
                            });
  }

  function vectorExpression () {
    return Arrow.EventArrow('vector expression',
                            { expression: { type: Arrow.ParameterType.script, value: null,
                                            changed: function (oldValue, newValue, arro) {
                                              // modify in-place for watchers
                                              arro.inputTypes.splice(0, arro.inputTypes.length); 
                                              if (newValue !== null) {
                                                for (var i = 0; i < newValue.length; i++) {
                                                  arro.inputTypes.push(Vector2.type);
                                                };
                                              }
                                            } }},
                            [], 
                            Vector2.type,
                            function () {
                              var inArray = Array.prototype.slice.call(arguments);
                              if (inArray.every(function (elm) { 
                                return Type.isRefinement(elm.type, Vector2.type)
                              })) {
                                var unboxed = inArray.map(function (elm) {
                                  return {
                                    x: elm.val.x.val,
                                    y: elm.val.y.val,
                                  };
                                });

                                if (this.parameters['expression'].value !== null) {
                                  var result = this.parameters.expression.value.apply(this, unboxed);
                                  return Vector2.Vector2 (Data.Number (result.x)) (Data.Number (result.y));
                                }
                              }
                            });
  }

  /* Merges two Signals together - whenever either input signal
   *   updates, the output signal will update.
   */
  var merge = 
    Arrow.SignalArrow('merge',
                      {},
                      [ Type.Variable ('a'), Type.Variable ('b') ],
                      Type.Union (Type.Variable ('a'), Type.Variable ('b')),
                      [[function (v, resultSig, inputs) { Signal.push(resultSig, v) }], 
                       [function (v, resultSig, inputs) { Signal.push(resultSig, v) }]]);

  /* Merges two Signals together - whenever either input signal
   *   updates, the output signal will update.
   */
  var sampleOn = 
    Arrow.SignalArrow('sampleOn',
                      {},
                      [ Type.Variable ('a'), Type.Variable ('b') ],
                      Type.Variable ('b'),
                      [[function (v, resultSig, inputs) { Signal.push(resultSig, Signal.pull(inputs[1])) }], 
                       []]);

  /* Creates an arrow which folds over past values of a signal. 
   *
   * transitionFunction : a -> b -> b
   * returnType : Type (`b`, above)
   * initialState : b
   */
  var foldp = function () {
    var result = Arrow.EventArrow('foldp',
                                  { initialState: {type: Arrow.ParameterType.script, value: null,
                                                   changed: function (oldValue, newValue, arrow) {
                                                     // TODO: update associated nodes
                                                   }},
                                    returnType: {type: Arrow.ParameterType.type, value: null, 
                                                 changed: function (oldValue, newValue, arrow) {
                                                   // TODO: update associated nodes
                                                   // Signal.push(this.signal, newValue);
                                                   arrow.returnType = newValue;
                                                 }},
                                    transitionFunction: {type: Arrow.ParameterType.script, value: null}}, 
                                  [Type.Variable('a')],
                                  null,
                                  function (v) {
                                    var result = this.parameters.transitionFunction.value(v, this.state);
                                    this.state = result;
                                    return result;
                                  },
                                  function (resultSignal) {
                                    Signal.push(resultSignal, this.parameters.initialState.value);
                                  });
    // result.state = this.parameters.initialState;
    return result;
  }

  var pushTo = function () {
    return Arrow.EventArrow('push to signal',
                            { signal: { type: Arrow.ParameterType.signal, value: null }},
                            [ Type.Variable('a') ],
                            Type.Variable('a'),
                            function (v) {
                              if (this.parameters.signal.value !== null && v !== undefined) {
                                Signal.push(this.parameters.signal.value, v);
                                return v;
                              }
                            });
  }

  // TODO: is there a nicer abstraction for mapping over signals than the full EventArrow?


  // this needs to be a constructed, because of the `previousValue` field
  var filterRepeats = function () {
    return Arrow.EventArrow('filter repeats',
                            {},
                            [ Type.Variable('a') ],
                             Type.Variable('a'),
                             function (v) {
                               if (!Data.equal(this.previousValue, v)) {
                                 this.previousValue = v;
                                 return v;
                               }
                             },
                             function (resultSignal, inputs) {
                               this.previousValue == Signal.pull(inputs[0]);
                             });
  };

  var matchType = function () {
    return Arrow.EventArrow('match type',
                            { type: {type: Arrow.ParameterType.type, value: null,
                                     changed: function (oldValue, newValue, arrow) {
                                       arrow.returnType = newValue;
                                     }}, 
                              defaultValue: {type: Arrow.ParameterType.script, value: null}},
                            [ Type.Variable('a') ],
                            null,
                            function (v) {
                              if (Type.isRefinement(v.type, this.parameters.type.value)) {
                                return v;
                              }
                            },
                            function (resultSignal) {
                              Signal.push(resultSignal, this.parameters.defaultValue.value);
                            });
  }

  var buildRecord = function () {
    return Arrow.EventArrow('build record',
                            { 'record type': {type: Arrow.ParameterType.type, value: null,
                                              changed: function (oldValue, newValue, node) {
                                                node.inputTypes = newValue.fields.map(ObjUtil.field('type'));
                                                node.returnType = newValue;
                                              }} },
                            null,
                            null,
                            function (vargs) {
                              var recType = this.parameters['record type'].value;
                              if (this.parameters['record type'].value !== null) {
                                var args = Array.prototype.slice.call(arguments);
                                var cons = Data.Record (recType);

                                return result = args.reduce(function (prev, elm) {
                                  return prev(elm);
                                }, cons);
                              }
                            });
  }

  var fieldAccess = function () {
    return Arrow.EventArrow('access field',
                            { 'field id': {type: Arrow.ParameterType.script, value: null,
                                           changed: function (newValue, oldValue, arrow) {
                                             arrow.inputTypes = [ Type.Record ([{ id: this.parameters['field id'].value, 
                                                                                  type: Type.Variable('a') }]) ];
                                           }}},
                            null,
                            Type.Variable('a'),
                            function (v) {
                              return v.val[this.parameters['field id'].value];
                            });
  }

  return {
    outputArrow: outputArrow,
    numberExpression: numberExpression,
    vectorExpression: vectorExpression,
    merge: merge,
    foldp: foldp,
    pushTo: pushTo,
    sampleOn: sampleOn,
    // make fresh state each time
    get filterRepeats () { return filterRepeats() },
    matchType: matchType,
    buildRecord: buildRecord,
    fieldAccess: fieldAccess
  }
});