/*
Default body for an Obj.
*/

define([ 'physicsjs' ], function (Physics) {
  Physics.body('obj', function (parent) {
    var defaults = {
      components: {}
    };

    return {
      init: function (options) {
        parent.init.call(this, options);
        options = Physics.util.extend({}, defaults, options);
        this.components = options.components;
        this.recalc();
      }
    }
  })
});