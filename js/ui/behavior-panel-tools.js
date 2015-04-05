/*
Performs common activities for a view into a single behavior.
*/

define([ 'underscore' ], function (_) {
  function BehaviorPanelToolController (mainController) {
    this.controller = mainController;
  }

  BehaviorPanelToolController.prototype = {
    // --- Patching --- //

    /*
     *
     * info : { to: { node: <node id>, inlet: <inlet idx> } }
     *      | { from: <node id> }
     */
    beginPatching: function (info) {
      console.log('began patching', info);

      // if (_.has(info, 'to')) {

      // } else if (_.has(info, 'from')) {
        
      // }
    },

    endPatching: function (outlet, inlet) {
      console.log('ended patching', info);
      // TODO
    },


    // -- Adding and removing nodes and edges -- //

    addNode: function (nodePrototype, atPosition) {
      var node = nodePrototype.construct();
      return this.controller.addNode(node, atPosition);
    },

    deleteNode: function (nodeId) {
      // TODO
    },

    addEdge: function (from, to) {
      // TODO
    },

    deleteEdge: function (edgeId) {
      // TODO
    },



    // --- Positioning nodes --- //
    /* The user can only position selected nodes. */


    positionState: {
      startPosition: { x: null, y: null }
    },

    beginPositionNodes: function (startPosition) {
      this.positionState.startPosition = startPosition;
    },

    movePositionNodes: function (position) {
      var delta = {
        x: position.x - this.positionState.startPosition.x,
        y: position.y - this.positionState.startPosition.y,
      };
      this.positionState.startPosition = position;

      _.each(_.values(this.controller.selection.nodes), 
             function (node) {
               node.view.position.x += delta.x;
               node.view.position.y += delta.y;
             });
    },

    endPositionNodes: function () {
      this.positionState.startPosition = { x: null, y: null };
    },

  }

  return BehaviorPanelToolController;
})