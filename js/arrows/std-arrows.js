/*
Defines standard operations for working with signals.
*/

define([ 'core/arrow'
       , 'core/datatypes'
       , 'core/data'
       , 'core/signals'
       , 'util/objutil' ], 
       function (Arrow, Type, Data, Signal, ObjUtil) {

  // function numberExpression (expr) {
  //   var argTypes = [];
  //   for (var i = 0; i < expr.length; i++) {
  //     argTypes.push(Type.Number);
  //   };

  //   return Arrow.EventArrow('number expression',
  //                           argTypes, 
  //                           Type.Number,
  //                           function () {
  //                             var inArray = Array.prototype.slice.call(arguments);
  //                             if (inArray.every(function (elm) { 
  //                               return Type.isRefinement(elm.type, Type.Number)
  //                             })) {
  //                               var unboxed = inArray.map(ObjUtil.field('val'));

  //                               return Data.Number (expr.apply(this, unboxed));
  //                             }
  //                           });
  // };

  function numberExpression () {
    var argTypesFn = function () {
      var result = [];
      for (var i = 0; i < this.parameters['expression'].length; i++) {
        result.push(Type.Number);
      };
      return result;
    };

    return Arrow.EventArrow('number expression',
                            [{type: Arrow.ParameterType.script, initial: null}],
                            argTypesFn, 
                            Type.Number,
                            function () {
                              var inArray = Array.prototype.slice.call(arguments);
                              if (inArray.every(function (elm) { 
                                return Type.isRefinement(elm.type, Type.Number)
                              })) {
                                var unboxed = inArray.map(ObjUtil.field('val'));

                                if (this.parameters['expression'].value !== null) {
                                  return Data.Number (this.parameters['expression'].value.apply(this, unboxed));
                                }
                              }
                            });
  };

  /* Merges two Signals together - whenever either input signal
   *   updates, the output signal will update.
   */
  var merge = Arrow.SignalArrow('merge',
                                [ Type.Variable ('a') 
                                , Type.Variable ('b')  ],
                                Type.Union (Type.Variable ('a'), Type.Variable ('b')),
                                [[function (resultSig, v) { Signal.push(resultSig, v) }], 
                                 [function (resultSig, v) { Signal.push(resultSig, v) }]]);

  /* Creates an arrow which folds over past values of a signal. 
   *
   * transitionFunction : a -> b -> b
   * returnType : Type (`b`, above)
   * initialState : b
   */
  var foldp = function (initialState, returnType, transitionFunction) {
    var result = Arrow.EventArrow('foldp',
                                  [Type.Variable('a') ],
                                  returnType,
                                  function (v) {
                                    var result = transitionFunction(v, this.state);
                                    this.state = result;
                                    return result;
                                  },
                                  function (resultSignal) {
                                    Signal.push(resultSignal, initialState);
                                  });
    result.state = initialState;
    return result;
  }

  var pushTo = function (toSignal) {
    return Arrow.EventArrow('push to signal',
                            [ Type.Variable('a') ],
                            Type.Variable('a'),
                            function (v) {
                              if (v !== undefined) {
                                Signal.push(toSignal, v);
                                return v;
                              }
                            });
  }

  // TODO: is there a nicer abstraction for mapping over signals than the full EventArrow?

  // var sampleOn = new Arrow([_, (type a)], (type b), function (trigger, v) {
  //   var result = new Signal((type b), undefined);

  //   subscribe(trigger, function (triggerVal) {
  //     result.push(v.current);  
  //   });

  //   return result;
  // });

  // this needs to be a constructed, because of the `previousValue` field
  var filterRepeats = function () {
    return Arrow.EventArrow('filter repeats',
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

  var matchType = function (type, defaultVal) {
    return Arrow.EventArrow('match type',
                            [ Type.Variable('a')  ],
                            type,
                            function (v) {
                              if (Type.isRefinement(v.type, type)) {
                                return v;
                              }
                            },
                            function (resultSignal) {
                              Signal.push(resultSignal, defaultVal);
                            });
  }

  var buildRecord = function (recType) {
    return Arrow.EventArrow('build record',
                            recType.fields.map(ObjUtil.field('type')),
                            recType,
                            function (vargs) {
                              var args = Array.prototype.slice.call(arguments);
                              var cons = Data.Record (recType);

                              // lol idk why i made these curried but w/e
                              return result = args.reduce(function (prev, elm) {
                                return prev(elm);
                              }, cons);
                            });
  }

  var fieldAccess = function (fieldId) {
    return Arrow.EventArrow('access field',
                            [ Type.Record ([{ id: fieldId, type: Type.Variable('a') }]) ],
                            Type.Variable('a'),
                            function (v) {
                              return v.val[fieldId];
                            });
  }

  return {
    numberExpression: numberExpression,
    merge: merge,
    foldp: foldp,
    pushTo: pushTo,
    // make fresh state each time
    get filterRepeats () { return filterRepeats() },
    matchType: matchType,
    buildRecord: buildRecord,
    fieldAccess: fieldAccess
    // sampleOn: sampleOn,
  }
});