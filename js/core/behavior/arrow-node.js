/*
An `ArrowNode` is a wrapper for an arrow class which mirrors
the graph representation of arrow networks. 

`ArrowNode`s can also represent input signals, signal assignment,
  and output paths.

You can plug or unplug each input into an `ArrowNode` separately: 
  `plug` will only be called on the underlying `Arrow` when 
    all necessary inputs are available.
  `unplug` will be called as soon as not all necessary inputs 
    are available.

However, upon unplugging inputs, the node will hold its last
  output signal value, until `plug` is called again on the
  underlying `Arrow`.
*/

define([ 'arrows/std-arrows'
       , 'core/signals'
       , 'core/arrow'
       , 'core/datatypes'
       , 'util/objutil' ], 
       function (StdArrows, Signal, Arrow, Type, ObjUtil) {
  function ArrowNode (arrow, id) {
    var inletList = [];
    if (arrow !== null) {
      for (var i = 0; i < arrow.inputTypes.length; i++) {
        inletList[i] = null;
      }
    }

    var _id = (id === undefined) ? nextId() : id;

    return Object.create(ArrowNode.prototype, {
      id: {
        enumerable: true,
        writable: false,
        value: _id
      },

      // underlying `Arrow`
      arrow: {
        enumerable: true,
        writable: true,
        value: arrow
      }, 

      // current instance of arrow, or null if no instance yet / invalid inputs
      arrowInstance: {
        enumerable: true,
        writable: true,
        value: null
      },

      // output signal of node; not always reflecting arrowInstance.signal!
      signal: {
        enumerable: true,
        writable: true,
        value: null
      },

      /* inlets : [ArrowNode]
       * Connections to this node's inputs, expressed as the connected nodes.
       * There can be at most one connection per inlet; thus, each element of this
       *   list corresponds to an inlet.
       */
      inlets: {
        enumerable: true,
        writable: true,
        value: inletList
      },

      /* outlet: [{ node: <ArrowNode>, inlet: <inlet number> }]
       * Connections to this node's output, with connected node and inlet of that node.
       * There can be any number of connections per outlet; thus, each element of this
       *   list corresponds to one such connection.
       */
      outlet: {
        enumerable: true,
        writable: true,
        value: {}
      }, 

      /* currentTypes : Type -> Type
       * Maps types to their most precise bindings on this node, given this node's current
       *   input connections.
       *
       *     // arrow : [ a, b ] -> a
       *     // numberOut : ArrowNode with Number output
       *     var node = ArrowNode(arrow);
       *     behavior.connect(numberOut, {node: node, inlet: 0});
       *
       *     node.currentTypes(Variable('a')) == Number
       *     node.currentTypes(String) == String
       *     node.currentTypes(Variable('b')) == undefined
       */
      currentTypes: {
        enumerable: true,
        writable: true,
        value: Type.solve([]).get
      }
    });
  }

  ArrowNode.prototype = Object.create(Object.prototype, {
    id: {
      enumerable: true,
      writable: false,
      value: null
    },

    // underlying `Arrow`
    arrow: {
      enumerable: true,
      writable: false,
      value: null
    }, 

    // current instance of arrow, or null if no instance yet / invalid inputs
    arrowInstance: {
      enumerable: true,
      writable: true,
      value: null
    },

    // output signal of node; not always reflecting arrowInstance.signal!
    signal: {
      enumerable: true,
      writable: true,
      value: null
    },

    /* inlets : [<String>]
     * Connections to this node's inputs, expressed as the connected nodes' identifiers.
     * There can be at most one connection per inlet; thus, each element of this
     *   list corresponds to an inlet.
     */
    inlets: {
      enumerable: true,
      writable: true,
      value: []
    },

    /* outlet : [{ node: <String>, inlet: <inlet number> }]
     * Connections to this node's output, with connected node's ID and inlet of that node.
     * There can be any number of connections per outlet; thus, each element of this
     *   list corresponds to one such connection.
     */
    outlet: {
      enumerable: true,
      writable: true,
      value: {}
    }, 

    /* currentTypes : Type -> Type
     * Maps types to their most precise bindings on this node, given this node's current
     *   input connections.
     *
     *     // arrow : [ a, b ] -> a
     *     // numberOut : ArrowNode with Number output
     *     var node = ArrowNode(arrow);
     *     behavior.connect(numberOut, {node: node, inlet: 0});
     *
     *     node.currentTypes(Variable('a')) == Number
     *     node.currentTypes(String) == String
     *     node.currentTypes(Variable('b')) == undefined
     */
    currentTypes: {
      enumerable: true,
      writable: true,
      value: function (ty) { return undefined }
    },

    setParameter: {
      enumerable: true,
      value: function (paramId, newValue) {
        // set inner parameter
        this.arrow.setParameter(paramId, newValue);

        // plug new instance
        var newInst = this.arrow.plug(this.inlets)

        // set my instance to new instance
      }
    }
  });

  function InputNode (inputSig) {
    var id = nextId();
    var outArrow = Arrow.OutputArrow(inputSig);
    var arrowInst = outArrow.plug();

    return Object.create(ArrowNode.prototype, {
      id: {
        enumerable: true,
        writable: false,
        value: id
      },

      // underlying `Arrow`
      arrow: {
        enumerable: true,
        writable: true,
        value: outArrow
      }, 

      // current instance of arrow, or null if no instance yet / invalid inputs
      arrowInstance: {
        enumerable: true,
        writable: true,
        value: arrowInst
      },

      // output signal of node; not always reflecting arrowInstance.signal!
      signal: {
        enumerable: true,
        writable: true,
        value: arrowInst.signal
      },

      /* inlets : [ArrowNode]
       * Connections to this node's inputs, expressed as the connected nodes.
       * There can be at most one connection per inlet; thus, each element of this
       *   list corresponds to an inlet.
       */
      inlets: {
        enumerable: true,
        writable: true,
        value: []
      },

      /* outlet: [{ node: <ArrowNode>, inlet: <inlet number> }]
       * Connections to this node's output, with connected node and inlet of that node.
       * There can be any number of connections per outlet; thus, each element of this
       *   list corresponds to one such connection.
       */
      outlet: {
        enumerable: true,
        writable: true,
        value: {}
      }, 

      position: {
        enumerable: true,
        writable: true,
        value: {
          x: 50,
          y: 50
        }
      }, 

      /* currentTypes : Type -> Type
       * Maps types to their most precise bindings on this node, given this node's current
       *   input connections.
       *
       *     // arrow : [ a, b ] -> a
       *     // numberOut : ArrowNode with Number output
       *     var node = ArrowNode(arrow);
       *     behavior.connect(numberOut, {node: node, inlet: 0});
       *
       *     node.currentTypes(Variable('a')) == Number
       *     node.currentTypes(String) == String
       *     node.currentTypes(Variable('b')) == undefined
       */
      currentTypes: {
        enumerable: true,
        writable: true,
        value: Type.solve([]).get
      }
    });
  }

  function OutputNode (outputSig) {
    return ArrowNode(StdArrows.pushTo(outputSig));
  }

  // /*
  // Returns a sparse view of a graph as nodes and edges. No references.

  // nodes   : an array of ArrowNodes
  // returns : a list of nodes and edges, in the form:
  //   {
  //     nodes: {
  //       <id>: [String]        // IDs of the outgoing edges for the node with ID `id`
  //     }, 
  //     edges: { 
  //       <id>: {
  //         from : String,      // ID of node
  //         to   : { 
  //           node  : String,   // ID of node
  //           inlet : Integer 
  //         }
  //       }
  //     }
  //   }
  // */
  // function sparseView (nodes) {
  //   var edgeId = function (from, to) {
  //     return from.id + '>>' + to.node.id + '$' + to.inlet;
  //   }

  //   var outgoingEdges = function (fromNode) {
  //     return ObjUtil.values(fromNode.outlet).reduce(function (acc, to) {
  //       acc[edgeId(fromNode, to)] = {
  //         from: fromNode.id,
  //         to: {
  //           node: to.node.id,
  //           inlet: to.inlet
  //         }
  //       };
  //       return acc;
  //     }, {});
  //   }

  //   var edges = nodes.map(outgoingEdges).reduce(ObjUtil.extend, {});

  //   var nodes = nodes.reduce(function (acc, node) {
  //     acc[node.id] = outgoingEdges(node);
  //     return acc;
  //   });

  //   return {
  //     nodes: nodes,
  //     edges: edges
  //   }
  // }

  // // TODO: finish this
  // function toposort (nodesIn) {
  //   // {
  //   //   nodes: {
  //   //     <id>: [String]        // IDs of the outgoing edges for the node with ID `id`
  //   //   }, 
  //   //   edges: { 
  //   //     <id>: {
  //   //       from : String,      // ID of node
  //   //       to   : { 
  //   //         node  : String,   // ID of node
  //   //         inlet : Integer 
  //   //       }
  //   //     }
  //   //   }
  //   // }
  //   // L ← Empty list that will contain the sorted elements
  //   var L_start = [];
  //   var grf_start = sparseView(nodesIn);
  //   // S ← Set of all nodes with no incoming edges
  //   var S_start = grf_start.nodes.filter(function (elm) {
  //     return ObjUtil.values(grf_start.edges).some(function (edge) {
  //       return edge.to.node == elm;
  //     });
  //   });
  //   helper(L_start, S_start, grf_start);

  //   function helper (L, S, graph) {
  //     if (S.length == 0) {
  //       return L;
  //     } else {
  //       [S = h:t]

  //       graph.edges.filter(function (edge) {
  //         return edge.to.node == h;
  //       }).map(function (edge) {
  //         // body...
  //       })

  //       helper(L ++ [h], S.slice(-1), );
  //     }

  //     while (S.length > 0) {
  //       var n = S.shift();
  //       L.push(n);  
  //       })
  //     }
  //   }
  // }


  // ----- Helpers ----- //

  var numberCreated = 0;
  function nextId () {
    return 'ArrowInstance' + numberCreated++;
  }

  return {
    ArrowNode: ArrowNode,
    InputNode: InputNode,
    OutputNode: OutputNode,
    // connect: connect,
    // disconnect: disconnect,
    // sparseView: sparseView
  }
});