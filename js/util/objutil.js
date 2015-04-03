define(function() {
  // from http://stackoverflow.com/questions/
  //        728360/most-elegant-way-to-clone-a-javascript-object
  function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = clone(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }

  /* Easy way of making a field access function.
   *
   * fd : the property key of the desired field

   var obj = { foo: 3, bar: 'str' };
   field('foo')(obj) === 3;
   field('foo')(undefined) === undefined;

   */
  function field (fd) {
    return function (obj) {
      if (obj !== undefined) {
        return obj[fd];
      } else {
        return undefined;
      }
    }
  }

  /* "Extends" the specified object with the supplied object's fields.
   *   Replaces existing primitive fields, or recursively extends nested objects.
   *
   * extend({ foo: 4 }, {}) == { foo: 4 }
   * extend({ foo: 4 }, { bar: 3 }) == { foo: 4, bar: 3 }
   * extend({ foo: 4 }, { foo: 5 }) == { foo: 5 }
   * extend({ 
   *   foo: 4, 
   *   bar: {
   *     baz: false
   *   }
   * }, 
   * { 
   *   bar: {
   *     baz: true,
   *     qux: 3    
   *   }
   * }) == {
   *   foo: 4,
   *   bar: {
   *     baz: false,
   *     qux: 3
   *   }
   * }
   */
  function extend (onObj, extendWith) {
    var result = clone(onObj);

    for (var key in extendWith) {
      if (onObj.hasOwnProperty(key) && isObject(extendWith[key]) && isObject(onObj[key])) {
        result[key] = extend(onObj[key], extendWith[key]);
      } else {
        result[key] = extendWith[key];
      }
    }

    return result;

    // var result = $.extend(true, {}, onObj, extendWith);
    // return result;
  }

  function isObject (val) {
    return val !== null && typeof val === 'object';
  }

  /* Maps over an object's properties, creating a new object.
   *
   * obj : an object
   * proc : a procedure to map over `obj`'s properties, taking two arguments:
   *          key   : the key of the current property
   *          value : the value of the current property
   *        and returns the new value for the property.
   */
  function objMap (obj, proc) {
    return Object.keys(obj).reduce(function (acc, key) {
      acc[key] = proc(key, obj[key]);
      return acc;
    }, {});
  }

  /* Gets the values of an object's properties as an array.
   * No guarantees on ordering.
   *
   *     var o = { foo: 1, bar: 'hey' }
   *     values(o) === [1, 'hey']
   *     // or, values(o) === ['hey', 1]
   */
  function values (obj) {
    return Object.keys(obj).map(function (key) {
      return obj[key];
    });
  }

  /*
  is `f` a useful function?

      var x = f({ foo: 0, bar: '', boo: true });

      var x_ = x({ foo: 3, bar: 'str' });
      var x__ = x_({ boo: false });

      x__ === { foo: 3, bar: '', boo: false }; // true
  */

  return {
    clone: clone,
    field: field,
    extend: extend,
    isObject: isObject,
    objMap: objMap,
    values: values
  };
});