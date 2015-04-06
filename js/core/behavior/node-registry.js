/*
Keeps a database of nodes that can be instantiated by the user.
*/

define([ 'core/datatypes'
       , 'core/data'
       , 'util/vector2'
       , 'core/behavior/arrow-node'
       , 'arrows/std-arrows' ], 
       function (Type, Data, Vector2, ArrowNode, StdArrows) {

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
    , { kind: 'filter repeats'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.filterRepeats);
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