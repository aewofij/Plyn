/*
Provides a graph-based interface into a single behavior.
*/

define([ 'underscore', 'core/signals', 'core/behavior/behavior' ], 
       function (_, Signal, Behavior) {

  function BehaviorPanelController (theScene) {
    if (!(this instanceof BehaviorPanelController)) 
      return new BehaviorPanelController(theScene);

    this.scene = theScene;
    this.activeBehavior = _.values(this.scene.behaviors)[0];
  }

  BehaviorPanelController.prototype = {

    // ---------- PUBLIC ---------- //

    // -- Access -- //

    get activeBehavior () {
      return this._activeBehavior;
    },

    set activeBehavior (newValue) {
      var self = this;
      if (this._activeBehavior !== null) {
        _.each(this._activeBehavior.nodes, function (node) {
          var nodeViewData = self.getNode(node.id).view;
          _.each(nodeViewData.outgoing, function (edge) {
            if (edge.shape != null) {
              edge.shape.visible = false;
            }
          });
        });
      }
      this._activeBehavior = newValue;
      _.each(this._activeBehavior.nodes, function (node) {
        var nodeViewData = self.getNode(node.id).view;
        _.each(nodeViewData.outgoing, function (edge) {
          if (edge.shape != null) {
            edge.shape.visible = true;
          }
        });
      });
    },

    get activeNodes() {
      return this.activeBehavior
             ? _.map(_.keys(this.activeBehavior.nodes), this.getNode, this)
             : [];
    },

    get activeEdges() {
      var self = this;

      if (this.activeBehavior) {
        return _.flatten(_.map(_.values(this.activeBehavior.nodes),
                               function (node) {
                                 return _.map(_.values(node.outlet), function (to) {
                                   return {
                                     id: Behavior.edgeId(node.id, 
                                                         { nodeId: to.node.id
                                                         , inlet: to.inlet }),
                                     from: self.getNode(node.id),
                                     to: {
                                       node: self.getNode(to.node.id),
                                       inlet: to.inlet
                                     }
                                   };
                                 });
                               }));
      } else {
        return [];
      }
    },

    // -- Modification -- //

    addNode: function (node, atPosition) {
      this.viewData[node.id] = new NodeViewData(this, node);
      this.viewData[node.id].position = atPosition;
      this.activeBehavior.addNode(node);
      return this.getNode(node.id);
    },

    /*
     * from : <node id>
     * to   : { nodeId: <node id>, inlet: <inlet idx> }
     */
    addEdge: function (from, to) {
      var self = this;

      var beh = this.activeBehavior;
      var fromNode = beh.getNode(from);
      var toNode = beh.getNode(to.nodeId);

      var disconnected = beh.connect(fromNode, {node: toNode, inlet: to.inlet});
      _.each(disconnected, function (elm) {
        var edgeId = Behavior.edgeId(elm.from.id, { nodeId: elm.to.node.id, inlet: elm.to.inlet });
        var viewData = self.getNode(elm.from.id).view;
        var cableShape = viewData.cableShapes[edgeId];
        if (cableShape != null) {
          if (cableShape.fabricObj !== null) {
            cableShape.fabricObj.remove();
          }
          if (cableShape.unsubscribe !== null) {
            cableShape.unsubscribe();
          }
          delete viewData.cableShapes[edgeId];
        }
      });
    },

    deleteEdge: function (edgeId) {
      // TODO
    },

    // -- Selection -- //

    selection: {
      nodes: {},
      edges: {}
    },

    addNodesToSelection: function (nodes) {
      this.selection.nodes = 
        _.extend(this.selection.nodes, _.reduce(nodes, function (acc, node) {
          acc[node.model.id] = node;
          return acc;
        }, {}));
    },

    addEdgesToSelection: function (edges) {
      // TODO
    },

    clearSelection: function () {
      this.selection = {
        nodes: {},
        edges: {}
      };
    },

    isNodeInSelection: function (nodeId) {
      return this.selection.nodes[nodeId] !== undefined;
    },

    isEdgeInSelection: function (edgeId) {
      console.log('isEdgeInSelection not implemented');
    },

    removeNodeFromSelection: function (nodeId) {
      delete this.selection.nodes[nodeId];
    },


    // ---------- PRIVATE ---------- //

    // the scene being viewed
    scene: null,

    // information about nodes which is only important for view
    viewData: {},

    // backing value for activeBehavior getter / setter
    _activeBehavior: null,

    getNode: function (id) {
      var model = this.activeBehavior.getNode(id);
      if (this.viewData[id] === undefined) {
        this.viewData[id] = new NodeViewData(this, model);
      }

      return {
        model: model,

        view: this.viewData[id]
      };
    }
  }

  function NodeViewData (bpc, model) {
    this.id = model.id;
    this.controller = bpc;
    this.position = {
      x: 0,
      y: 0
    };
    this.cableShapes = {};
  }

  NodeViewData.prototype = {
    // id : <id of owner node>
    id: null,

    // controller : BehaviorPanelController
    controller: null,

    position: {
      x: null,
      y: null
    },

    // outgoing : [{ from: <node id>, to: { node: <node id>, inlet: <inlet index> }}]
    get outgoing () {
      var model = this.controller.getNode(this.id).model;
      return _.map(_.values(model.outlet), function (to) {
        var sparseTo = {
          nodeId: to.node.id,
          inlet: to.inlet
        };
        return {
          id: Behavior.edgeId(model.id, sparseTo),
          from: model.id,
          to: sparseTo
        };
      })
    }, 

    // maps edge ID to FabricJS shape for outgoing cables
    cableShapes: [{
      // FabricJS object for this cable
      fabricObj: null, 

      // call this function to unsubscribe from cable updaters
      unsubscribe: null
    }],

    get isSelected () {
      return this.controller.isNodeInSelection(this.id);
    },

    // /* Convenience method for subscribing to this node's output signal.
    //  *
    //  * callback : function to be called with the signal's new value
    //  * returns  : unsubscribe function
    //  */
    // subscribe: function (callback) {
    //   var outSig = this.controller.getNode(this.id).model.signal;
    //   if (outSig !== null) {
    //     return Signal.subscribe(outSig, callback);
    //   } else {
    //     return function () { return };
    //   }
    // },
  }

  return BehaviorPanelController;
});