/*
Keeps a database of nodes that can be instantiated by the user.
*/

define([ 'core/datatypes'
       , 'util/vector2'
       , 'core/behavior/arrow-node'
       , 'arrows/std-arrows' ], 
       function (Type, Vector2, ArrowNode, StdArrows) {

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
      , parameters: []
      }
    , { kind: 'signal'
      , construct: function () {
          return function (signal) {
            return ArrowNode.InputNode(signal);
          };
        }
      , parameters: [ { type: ParameterType.signal
                      , description: 'the signal'
                      } 
                    ]
      }
    , { kind: 'sum'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.numberExpression()
                                              .setParameter('expression', function (v1,v2) {
                                                                            return v1 + v2;
                                                                          }));
        }
      , parameters: []
      }
    , { kind: 'filter repeats'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.filterRepeats);
        }
      , parameters: []
      }
    , { kind: 'match number'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.matchType()
                                              .setParameter('type', Type.Number));
        }
      , parameters: []
      }
    , { kind: 'match vector'
      , construct: function () {
          return ArrowNode.ArrowNode(StdArrows.matchType()
                                              .setParameter('type', Vector2.type));
        }
      , parameters: []
      }
    ]

  var kindToNode = nodes.reduce(function (acc, elm) {
    acc[elm.kind] = elm;
    return acc;
  }, {});

  function getNode (kind) {
    var nodeEntry = kindToNode[kind];
    if (nodeEntry === undefined) {
      throw new Error('No such node: ', kindToNode);
    } else {
      var instance = (function () {
        if (nodeEntry.parameters.length !== undefined 
            && nodeEntry.parameters.length > 0) {
          return {
            node: nodeEntry.construct.apply(nodeEntry, 
                                            _.map(nodeEntry.parameters, defaultParameter)),
            parameters: []
          };
        } else {
          return {
            node: nodeEntry.construct(),
            parameters: []
          };
        }
      })();

      return {
        info: nodeEntry,
        instance: instance
      };
    }
  }

  return {
    getNode: getNode,
    all: nodes,
    ParameterType: ParameterType
  };
});