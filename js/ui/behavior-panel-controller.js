/*
Provides a graph-based interface into a single behavior.
*/

define([ 'underscore', 'core/signals' ], function (_, Signal) {

  function BehaviorPanelController (theScene) {
    if (!(this instanceof BehaviorPanelController)) 
      return new BehaviorPanelController(theScene);

    this.scene = theScene;
    this.activeBehavior = _.values(this.scene.behaviors)[0];
    // Object.observe(this.scene, update); // ?
  }

  BehaviorPanelController.prototype = {

    // ---------- PUBLIC ---------- //

    // -- Access -- //

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
                                     from: self.getNode(node.id),
                                     to: {
                                       node: self.getNode(to.nodeId),
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

    activeBehavior: null,

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
    this.outgoing = _.map(_.values(model.outlet), function (to) {
      return {
        from: model.id,
        to: to
      };
    });
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
    outgoing: null, 

    get isSelected () {
      return this.controller.isNodeInSelection(this.id);
    },

    /* Convenience method for subscribing to this node's output signal.
     *
     * callback : function to be called with the signal's new value
     * returns  : unsubscribe function
     */
    subscribe: function (callback) {
      var outSig = this.controller.getNode(this.id).model.signal;
      if (outSig !== null) {
        return Signal.subscribe(outSig, callback);
      } else {
        return function () { return };
      }
    },

    // getInletPosition: function (index) {
    //   // TODO
    // },

    // getOutletPosition: function () {
    //   // TODO
    // },

    // getBounds: function () {
    //   // TODO
    // },
  }

  return BehaviorPanelController;
});