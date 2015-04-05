/*
A `Behavior` is a named network of signal mappings (represented
as `ArrowNodes`).
*/

define([ 'core/datatypes'
       , 'core/signals'
       , 'core/behavior/arrow-node'
       , 'util/listutil'
       , 'util/objutil'
       , 'underscore' ], 
       function (Type, Signal, ArrowNode, ListUtil, ObjUtil, _) {
  function Behavior (name, nodes) {
    if (!(this instanceof Behavior)) {
      return new Behavior(name, nodes);
    }

    this.name = name;
    if (nodes !== undefined) {
      var self = this;
      nodes.forEach(function (elm) {
        self.nodes[elm.id] = elm;
      });
    } else {
      this.nodes = {};
    }
  }

  Behavior.prototype = Object.create(Object.prototype, {
    // user-supplied name for this behavior
    name: {
      enumerable: true,
      writable: true,
      value: null
    }, 

    // dictionary of id -> `ArrowNode`s
    nodes: {
      enumerable: true,
      writable: true,
      value: {}
    },

    getNode: {
      value: function (id) {
        var result = this.nodes[id];
        if (result === undefined) {
          throw new Error('Tried to look up unregistered node ' + id);
        } else {
          return result;
        }
      }
    },

    /* Creates a view of all outgoing edges in the graph. 
     *
     * returns: { <edge id>: { from: <node id>, to: { node: <node id>, inlet: <inlet index> } } }
     */
    outgoingEdges: {
      value: function () {
        var outgoing = function (fromNode) {
          return _.values(fromNode.outlet).reduce(function (acc, to) {
            acc[edgeId(fromNode, to)] = {
              from: fromNode.id,
              to: {
                node: to.nodeId,
                inlet: to.inlet
              }
            };
            return acc;
          }, {});
        };

        var buildObj = _.partial(_.extend, {});
        return buildObj.apply(this, _.values(this.nodes).map(outgoing));
      }
    },

    addNode: {
      value: function (node) {
        for (var i = 0; i < arguments.length; i++) {
          if (this.nodes[arguments[i].id] === undefined) {
            this.nodes[arguments[i].id] = arguments[i];
          }
        }
        return this;
      }
    },

    addNodes: {
      value: function (node1, node2) {
        return this.addNode.apply(this, arguments);
      }
    },

    removeNode: {
      value: function (node) {
        delete this.nodes[node.id];
        return this;
      }
    },

    /* Connects a node's outlet to a specific inlet of another node.
     *
     * from : ArrowNode
     * to   : { node: ArrowNode, inlet: int }
     */
    connect: {
      value: function connect (from, to) {
        ArrowNode.connect(from, to);
        // var self = this;

        // // disconnect anything previously connected to `to`
        // if (to.node.inlets[to.inlet] !== null) {
        //   self.disconnect(self.getNode(to.node.inlets[to.inlet]), to);
        // }

        // // add edges
        // // TODO: make this hash based off of edge, not node?
        // from.outlet[to.node.id] = {
        //   nodeId: to.node.id,
        //   inlet: to.inlet
        // };
        // to.node.inlets[to.inlet] = from.id;

        // // check (partial) input types
        // var solution = Type.solve(to.node.inlets.map(function (srcNodeId, idx) {
        //   if (srcNodeId !== null) {
        //     var srcNode = self.getNode(srcNodeId);
        //     var srcCalcRtn = srcNode.currentTypes(srcNode.arrow.returnType);

        //     var variableUnion = (function hasVariableUnion (ty) {
        //       return ty.category === 'Variable' 
        //           || (ty.category === 'Union' && ty.types.some(hasVariableUnion));
        //     })(srcCalcRtn);

        //     if (!variableUnion) {
        //       return Type.refined(srcCalcRtn,
        //                           to.node.arrow.inputTypes[idx]);
        //     } else {
        //       return null;
        //     }
        //   } else {
        //     return null;
        //   }
        // }).filter(function (elm) { return elm !== null }));

        // if (!solution.checks) {
        //   // disconnect new connection, abort
        //   self.disconnect(from, to);
        //   return;
        // } else {
        //   // set current type map for `to`'s node
        //   to.node.currentTypes = solution.get;
        // }

        // // if all inlets have connections,
        // if (to.node.inlets.every(function (elm) { return elm !== null
        //                                               && self.getNode(elm).signal !== null })) {
        //   // instantiate the arrow
        //   // (clone in case of stateful arrow)
        //   var arrowInst = ObjUtil.clone(to.node.arrow)
        //                          .plug
        //                          .apply(to.node.arrow, 
        //                                 to.node.inlets.map(self.getNode, self)
        //                                               .map(_.property('signal')));

        //   // update `to`'s instance fields
        //   // - unplug existing arrow
        //   if (to.node.arrowInstance !== null) {
        //     to.node.arrowInstance.unplug();
        //   }
        //   // - set arrow instance
        //   to.node.arrowInstance = arrowInst;
        //   // - update output signal
        //   to.node.signal = arrowInst.signal;

        //   // pull new value from ancestors
        //   to.node.arrowInstance.pull();

        //   // attempt to reconnect nodes previously connected to `to`'s outlet
        //   //   (they'll pull the new value from `to` if they want it)
        //   Object.keys(to.node.outlet).forEach(function (key) {
        //     var connectedNode = {
        //       node: self.getNode(to.node.outlet[key].nodeId),
        //       inlet: to.node.outlet[key].inlet
        //     }
        //     if (Type.isRefinement(to.node.signal.type, 
        //                           connectedNode.node.arrowInstance.inputs[connectedNode.inlet].type)) {
        //       self.connect(to.node, connectedNode);
        //     } else {
        //       // TODO: somehow notify on this?
        //       // console.log('Disconnected ' + to.node.name + ' from ' + connectedNode.node.name);
        //       self.disconnect(to.node, connectedNode);
        //     }
        //   });

        // } 
      }
    },

    /* Removes the specified connection from the graph.
     *
     * from : the `ArrowNode` whose outlet is part of the connection
     * to   : the `ArrowNode` and inlet index of the other end of the connection,
     *          in the form `{ node: <ArrowNode>, inlet: <Integer> }`
     */
    disconnect: {
      value: function (from, to) {
        ArrowNode.disconnect(from, to);
        // // remove to from from.outlet
        // delete from.outlet[to.node.id];
        // to.node.inlets[to.inlet] = null;

        // if (to.node.arrowInstance !== null) {
        //   to.node.arrowInstance.unplug();
        // }
      }
    },

    /* "Swaps" in a new node in an old node's place. If the new node is not yet
     *   registered in this `Behavior`, this method will register it.
     * If the inputs of the new node "fit" the inputs of the old node,
     *   (that is, if the parity is the same and the inputs are all
     *   refinements of the new node's input types), then the previous input edges
     *   are connected to the new node.
     * Similarly, if the output of the new node fits the output of the old node,
     *   the previous output edge is connected to the new node's output.
     *
     * oldNode : ArrowNode
     * newNode : ArrowNode
     * returns : the new node, after swapping
     */
     swapNode: {
      value: function (oldNode, newNode) {
        var self = this;

        // register new node
        self.addNode(newNode);

        // set new node to same position
        newNode.position = oldNode.position;

        // can we reuse the inputs of the old node?
        var inputsFit = (function (existingParents, newTypes) {
          if (!existingParents.every(function (elm) { return elm !== null })) {
            return false;
          }

          var existingTypes = existingParents.map(ObjUtil.field('signal'))
                                             .map(ObjUtil.field('type'));

          if (existingTypes.length === newTypes.length) {
            var solution = Type.solve(ListUtil.map2(existingTypes,
                                                    newTypes,
                                                    function (existentTy, newTy) {
              return Type.refined(existentTy, newTy);
            }));
            return solution;
          }
          return {
            checks: false
          };
        })(oldNode.inlets,
           newNode.arrow.inputTypes);

        // console.log(oldNode.inlets.map(self.getNode, self)
        //                  .map(ObjUtil.field('signal'))
        //                  .map(ObjUtil.field('type')),
        //    newNode.arrow.inputTypes);

        if (inputsFit.checks) {
          // try connecting with your parents
          oldNode.inlets.forEach(function (srcNode, inlet) {
            self.connect(srcNode, { node: newNode, inlet: inlet });
          });

          // try connecting with your children
          ObjUtil.values(oldNode.outlet).forEach(function (elm) {
            self.connect(newNode, elm);
          });

          // var relRtnType = inputsFit.get(newNode.arrow.returnType);
          // // if return type is not bounded by type constraints,
          // //   or if we have a simple refinement,
          // // TODO: I think this can have some weirdness with variable return types...
          // if (relRtnType === undefined || Type.isRefinement(relRtnType, oldNode.)) {
          //   // connect previous output
          // }
        } else {
          // inputs don't fit, but maybe some outputs do!

          // a bit weird because of first-order type variables...
          var newRtnTy = newNode.arrow.returnType;
          ObjUtil.values(oldNode.outlet).forEach(function (dstInfo) {
            var dstNode = dstInfo.node;
            var variableUnion = (function hasVariableUnion (ty) {
              return ty.category === 'Variable' 
                  || (ty.category === 'Union' && ty.types.some(hasVariableUnion));
            })(newRtnTy);
            if (variableUnion
                || Type.isRefinement(newRtnTy, dstNode.arrow.inputTypes[dstInfo.inlet])) {
              // output fits, plug ittt
              self.connect(newNode, {
                node: dstNode,
                inlet: dstInfo.inlet
              });
            } 
          });
        }

        // clean up after old node
        if (oldNode.arrowInstance !== null) {
          oldNode.arrowInstance.unplug();
        }
        oldNode.arrowInstance = null;
        delete self.nodes[oldNode.id];

        return newNode;
      }
    }
  });


  // 
  //    dimensionsFor : NodeId -> { width: number, height: number }
  function autoArrange (behavior, dimensionsFor) {
    var sparse = ArrowNode.sparseView(ObjUtil.values(behavior.nodes));
    Object.keys(sparse.nodes).forEach(function (nodeKey) {
      var node = sparse.nodes[nodeKey];

      // pick a node
      // if you haven't met any of its neighbors,
      //   
      // if you've encountered any of its neighbors,
      //   connect them and set relative offset (?)

    });
  }

  function serialize (beh) {
    return {
      name: beh.name,
      nodes: ObjUtil.values(beh.nodes).map(function (node) {
        return {
          id: node.id,
          arrow: node.arrow,
          // inlets: node.inlets,
          outlet: node.outlet,
          position: node.position
        };
      })
    };
  }

  function parse (data) {
    var result = Behavior(data.name);
    var toConnect = [];

    result.addNode.apply(result, data.nodes.map(function (node) {
      var result = ArrowNode.ArrowNode(node.arrow, node.id);
      result.position = node.position;
      toConnect = toConnect.concat(ObjUtil.values(node.outlet).map(function (to) {
        return {
          from: node,
          to: to
        };
      }));
      return result;
    }));

    console.log(result);

    toConnect.forEach(function (edge) {
      result.connect(edge.from, { node: result.getNode(edge.to.nodeId), inlet: edge.to.inlet });
    });
  }


  function edgeId (from, to) {
    return from.id + '>>' + to.nodeId + '$' + to.inlet;
  }

  /*
  Returns a sparse view of a behavior graph as nodes and edges. 
  The result is a new, acyclic object; with no references to the original graph.

  beh     : the Behavior to be viewed
  returns : a list of nodes and edges in `beh`, in the form:
    {
      nodes: {
        <id>: [String]        // IDs of the outgoing edges for the node with ID `id`
      }, 
      edges: { 
        <id>: {
          from : String,      // ID of node
          to   : { 
            node  : String,   // ID of node
            inlet : Integer 
          }
        }
      }
    }
  */
  function sparseView (beh) {
    if (beh == null || beh == undefined) {
      return null;
    }

    var behNodes = _.values(beh.nodes);

    var outgoing = function (fromNode) {
      return _.values(fromNode.outlet).reduce(function (acc, to) {
        acc[edgeId(fromNode, to)] = {
          from: fromNode.id,
          to: {
            node: to.nodeId,
            inlet: to.inlet
          }
        };
        return acc;
      }, {});
    };

    var nodes = behNodes.reduce(function (acc, node) {
      acc[node.id] = outgoing(node);
      return acc;
    }, {});

    return {
      nodes: nodes,
      edges: beh.outgoingEdges()
    }
  }


  return {
    Behavior: Behavior,
    serialize: serialize,
    parse: parse,
    sparseView: sparseView
  }

});