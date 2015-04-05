/*
Performs common activities for a view into a single behavior.
*/

define([ 'underscore' ], function (_) {
  function BehaviorPanelToolController (mainController) {
    this.controller = mainController;
  }

  BehaviorPanelToolController.prototype = {
    // --- Patching --- //

    patchState: {
      from: null,
      to: null
    },

    /*
     *
     * info : { to: { nodeId: <node id>, inlet: <inlet idx> } }
     *      | { from: <node id> }
     */
    beginPatching: function (info) {
      if (_.has(info, 'to')) {
        this.patchState.to = info.to;
      } else if (_.has(info, 'from')) {
        this.patchState.from = info.from;
      }
    },

    endPatching: function (info) {
      if (_.has(info, 'to')) {
        this.controller.addEdge(this.patchState.from, info.to);
      } else if (_.has(info, 'from')) {
        this.controller.addEdge(info.from, this.patchState.to);
      } else {
        // console.log('ended patching at nowhere');
      }

      // Reset patch state.
      this.patchState = {
        from: null,
        to: null
      };
    },


    // -- Adding and removing nodes and edges -- //

    addNode: function (nodePrototype, atPosition) {
      var node = nodePrototype.construct();
      return this.controller.addNode(node, atPosition);
    },

    deleteNode: function (nodeId) {
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