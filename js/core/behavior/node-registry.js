/*
Keeps a database of nodes that can be instantiated by the user.
*/

define([ 'core/datatypes'
       , 'core/data'
       , 'util/vector2'
       , 'core/arrow'
       , 'core/behavior/arrow-node'
       , 'arrows/std-arrows' ], 
       function (Type, Data, Vector2, Arrow, ArrowNode, StdArrows) {

  var ParameterType = {
    signal: 'signal',
    type: 'type',
    script: 'script'
  };

  function defaultParameter (parameterType) {
    switch (parameterType) {
      case ParameterType.signal: return Signal.Signal(Type.Variable('a')); // ?
      case ParameterType.type: return Type.Variable('a');
    }
  }

  var nodes =
    [ { kind: 'merge'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.merge);
        }
      }
    , { kind: 'signal'
      , construct: function () {
          return ArrowNode.InputNode();
        }
      }
    , { kind: 'sum'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.numberExpression()
                                              .setParameter('expression', function (v1,v2) {
                                                                            return v1 + v2;
                                                                          }));
        }
      }
    , { kind: 'translate'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.vectorExpression()
                                              .setParameter('expression', function (v1,v2) {
                                                                            return {
                                                                              x: v1.x + v2.x,
                                                                              y: v1.y + v2.y,
                                                                            };
                                                                          }), { name: 'translate' });
        }
      }
    , { kind: 'scale vec'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.scaleVec(), { name: 'scale vector' });
        }
      }
    , { kind: 'diagonal'
      , construct: function () {
          return ArrowNode.ArrowNode(Arrow.EventArrow('diagonal',
                                    {},
                                    [Type.Number], 
                                    Vector2.type,
                                    function (scale) {
                                      return Vector2.Vector2 (Data.Number (scale.val)) 
                                                             (Data.Number (scale.val))
                                    }), { name: 'diagonal' });
        }
      }
    , { kind: 'unit vec'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.constant(Vector2.Vector2 (Data.Number(1)) 
                                                                        (Data.Number(1))), 
                                     { name: 'unit vector' });
        }
      }
    , { kind: 'access x'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.fieldAccess()
                                              .setParameter('field id', 'x'), 
                                     { name: 'access x' });
        }
      }
    , { kind: 'access y'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.fieldAccess()
                                              .setParameter('field id', 'y'), 
                                     { name: 'access y' });
        }
      }
    , { kind: 'filter repeats'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.filterRepeats);
        }
      }
    , { kind: 'flip horizontal'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.vectorExpression()
                                              .setParameter('expression', function (vec) {
                                                return {
                                                  x: -vec.x + 1300,
                                                  y: vec.y
                                                };
                                              }), { name: 'flip horizontal' });
        }
      }
    , { kind: 'distance'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.distance(), { name: 'distance' });
        }
      }
    , { kind: 'match number'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.matchType()
                                              .setParameter('type', Type.Number)
                                              .setParameter('defaultValue', Data.Number(0)));
        }
      }
    , { kind: 'match vector'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.matchType()
                                              .setParameter('type', Vector2.type)
                                              .setParameter('defaultValue', 
                                                            Vector2.Vector2 (Data.Number(0))
                                                                            (Data.Number(0))));
        }
      }
    , { kind: 'build vector'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.buildRecord()
                                              .setParameter('record type', Vector2.type))
        }
      }
    ]

  var kindToNode = nodes.reduce(function (acc, elm) {
    acc[elm.kind] = elm;
    return acc;
  }, {});

  function getNode (kind) {
    var nodeEntry = kindToNode[kind];
    if (nodeEntry === undefined) {
      throw new Error('No such node: ', kind);
    } else {
      return nodeEntry;
      // var instance = (function () {
      //   if (nodeEntry.parameters.length !== undefined 
      //       && nodeEntry.parameters.length > 0) {
      //     return {
      //       node: nodeEntry.construct.apply(nodeEntry, 
      //                                       _.map(nodeEntry.parameters, defaultParameter)),
      //       parameters: []
      //     };
      //   } else {
      //     return {
      //       node: nodeEntry.construct(),
      //       parameters: []
      //     };
      //   }
      // })();

      // return {
      //   info: nodeEntry,
      //   instance: instance
      // };
    }
  }

  return {
    getNode: getNode,
    all: nodes,
    ParameterType: ParameterType
  };
});