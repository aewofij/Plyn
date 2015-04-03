/*
Defines useful functions for working with arrays.
*/

define(function () {
  function map2 (l1, l2, fn) {
    var result = [];
    for (var i = 0; i < l1.length; i++) {
      result[i] = fn(l1[i],l2[i]);
    }
    return result;
  }

  return {
    map2: map2
  };
})