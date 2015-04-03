define([], function() {
  function curry (proc, args) {
    if (proc.length === args.length) {
      return proc.apply(this, args);
    } else {
      var ct = function (a) {
        // using Array.prototype.concat so that we 
        //  don't modify the original `args`
        return curry(proc, args.concat([a]));
      };

      return ct;
    }
  }

  return {
    curry: curry
  }
});