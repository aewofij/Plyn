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
    var _id = (id === undefined) ? nextId() : id;

    var result = Object.create(ArrowNode.prototype, {
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

    if (arrow !== null) {
      var createInlets = function (node, _, inputTypes) {
        var inputTypes = node.arrow.inputTypes;
        var inletList = [];
        for (var i = 0; i < inputTypes.length; i++) {
          inletList[i] = node.inlets[i] === undefined ? null : node.inlets[i];
        }
        node.inlets = inletList;
      }
      createInlets.call(null, result, null, arrow.inputTypes);
      Array.observe(arrow.inputTypes, _.partial(createInlets, result));
    }

    return result;
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
  });

  function InputNode (inputSig) {
    var id = nextId();
    var outArrow = Arrow.OutputArrow();
    if (inputSig !== undefined) {
      outArrow.setParameter('signal', inputSig);
    }
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
    var arrow = StdArrows.pushTo();
    if (outputSig !== undefined) {
      arrow.setParameter('signal', outputSig);
    }
    return ArrowNode(arrow);
  }

  /* Connects a node's outlet to a specific inlet of another node.
   *
   * from : ArrowNode
   * to   : { node: ArrowNode, inlet: int }
   */
  function connect (from, to) {
    var self = this;
    var disconnected = [];

    // disconnect anything previously connected to `to`
    if (to.node.inlets[to.inlet] !== null 
        && to.node.inlets[to.inlet] !== undefined) {

      disconnected.push({ from: to.node.inlets[to.inlet], to: to });
      self.disconnect(to.node.inlets[to.inlet], to);
    }

    // add edges
    // TODO: make this hash based off of edge, not node?
    //       connecting multiple outlets of node A to node B will not work
    from.outlet[to.node.id] = to;
    to.node.inlets[to.inlet] = from;

    // check (partial) input types
    var solution = Type.solve(to.node.inlets.map(function (srcNode, idx) {
      if (srcNode !== null) {
        var srcCalcRtn = srcNode.currentTypes(srcNode.arrow.returnType);

        var variableUnion = (function hasVariableUnion (ty) {
          return ty.category === 'Variable' 
             || (ty.category === 'Union' && ty.types.some(hasVariableUnion));
        })(srcCalcRtn);

        if (!variableUnion) {
          return Type.refined(srcCalcRtn,
                              to.node.arrow.inputTypes[idx]);
        } else {
          return null;
        }
      } else {
        return null;
      }
    }).filter(function (elm) { return elm !== null }));

    if (!solution.checks) {
      // disconnect new connection, abort
      disconnected.push({ from: from, to: to });
      self.disconnect(from, to);
      return disconnected;
    } else {
      // set current type map for `to`'s node
      to.node.currentTypes = solution.get;
    }

    // if all inlets have connections,
    if (to.node.inlets.every(function (elm) { return elm !== null
                                                  && elm.signal !== null })) {
      // instantiate the arrow
      // (clone in case of stateful arrow)
      var arrowInst = ObjUtil.clone(to.node.arrow)
                             .plug
                             .apply(to.node.arrow, 
                                    to.node.inlets.map(_.property('signal')));

      // update `to`'s instance fields
      // - unplug existing arrow
      if (to.node.arrowInstance !== null) {
        to.node.arrowInstance.unplug();
      }
      // - set arrow instance
      to.node.arrowInstance = arrowInst;
      // - update output signal
      to.node.signal = arrowInst.signal;

      // pull new value from ancestors
      to.node.arrowInstance.pull();

      // successfully connected this pair; 
      // remove from disconnect list if added above
      disconnected = _.reject(disconnected, function (elm) {
        return elm.from.id == from.id
            && elm.to.node.id == to.node.id
            && elm.to.inlet == to.inlet;
      });

      // attempt to reconnect nodes previously connected to `to`'s outlet
      //   (they'll pull the new value from `to` if they want it)
      _.values(to.node.outlet).forEach(function (connectedNode) {
        var getType = connectedNode.node.currentTypes;
        if (Type.isRefinement(to.node.signal.type, 
                              getType(connectedNode.node.arrow.inputTypes[connectedNode.inlet]))) {
                              // connectedNode.node.arrowInstance.inputs[connectedNode.inlet].type)) {
          var childDisconnects = self.connect(to.node, connectedNode);
          disconnected = disconnected.concat(childDisconnects);
        } else {
          disconnected.push({ from: to.node, to: connectedNode });
          self.disconnect(to.node, connectedNode);
        }
      });

    } 
    return disconnected;
  }

  /* Removes the specified connection from the graph.
   *
   * from : the `ArrowNode` whose outlet is part of the connection
   * to   : the `ArrowNode` and inlet index of the other end of the connection,
   *          in the form `{ node: <ArrowNode>, inlet: <Integer> }`
   */
  function disconnect (from, to) {
    // remove to from from.outlet
    delete from.outlet[to.node.id];
    to.node.inlets[to.inlet] = null;

    if (to.node.arrowInstance !== null) {
      to.node.arrowInstance.unplug();
    }
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
    connect: connect,
    disconnect: disconnect,
    // sparseView: sparseView
  }
});