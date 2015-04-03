/*
Defines wrappers for typed data.
*/

define([ 'core/datatypes'
       , 'util/listutil'
       , 'util/objutil' ], function (Type, List, ObjUtil) {
  /* Creates a primitive constructor, given the primitive's type.
   *
   * primType : Type
   * returns  : construction function which takes a Javascript
   *              "primitive" (int | string | bool) and returns
   *              a wrapped object { type: Type, val: int|string|bool }
   */
  function constructPrimitive (primType) {
    return function (val) {
      return {
        type: primType,
        val: val
      };
    };
  }

  /* Creates a record constructor, given the record's type.
   *
   * recType : Type (the full type of the record)
   * returns : curried constructor which takes an arg list 
   *            of type { type: Type, val: <value> }
   */
  function constructRecord (recType) {
    return recordConstructor(recType, recType.fields, {});
  }

  /* Recursively create a record constructor, given the record's fields' types.
   *
   * recType : Type (the full type of the record)
   * fields  : [{ id : String, type : Type }]
   * acc     : Object
   * returns : curried constructor which takes an arg list 
   *            of type { type: Type, val: <value> }
   */
  function recordConstructor (recType, fields, acc) {
    if (fields.length === 0) {
      return {
        type: recType,
        val: acc
      };
    }
    else {
      return function (fieldVal) {
        if (Type.isRefinement(fieldVal.type, fields[0].type)) {
          var id = fields[0].id;
          var toAdd = {};
          toAdd[id] = fieldVal;
          return recordConstructor(recType, fields.slice(1), ObjUtil.extend(acc, toAdd));
        } else {
          // TODO: better error
          throw new Error('Failed typecheck');
        }
      };
    }
  }

  /* Checks if `d` is a valid, typed/boxed datum. */
  function isValidData (d) {
    return d && d.hasOwnProperty('type') && d.hasOwnProperty('val');
  }

  /* Checks if boxed data `dat1` and `dat2` are equal. */
  function equal(dat1, dat2) {
    if (!isValidData(dat1) && !isValidData(dat2)) {
      throw new Error('Invalid data supplied to `equal`.', dat1, dat2);
    } else if (!isValidData(dat1) || !isValidData(dat2)) {
      // one invalid data and one valid => valid test, not equal
      return false;
    }

    if (isPrimitive(dat1.type)) {
      if (isPrimitive(dat2.type)) { 
        return Type.isRefinement(dat1.type, dat2.type)
            && Type.isRefinement(dat2.type, dat1.type)
            && (dat1.val === dat2.val);
      } else {
        return false;
      }
    } else {
      if (!isPrimitive(dat2.type)) {
        // TODO: probably more efficient to write a new check here
        if (Type.isRefinement(dat1.type, dat2.type)
            && Type.isRefinement(dat2.type, dat1.type)) {
          var fieldsPassed = List.map2(Object.keys(dat1.val),
                                       Object.keys(dat2.val), 
                                       function (l, r) {
                                         if (dat1.val[l] !== undefined 
                                              && dat2.val[r] !== undefined) {
                                           return equal(dat1.val[l], dat2.val[r]);
                                         } else if (dat1.val[l] === undefined 
                                              && dat2.val[r] === undefined) {
                                           return true;
                                         } else {
                                           return false;
                                         }
                                       });
          return fieldsPassed.every(function (elm) { return elm === true; });
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  // injects a datum into a union type
  function injectUnion (unionType) {
    return function (data) {
      // type check
      var checks = unionType.types.some(function (elm) {
        return Type.isRefinement(data.type, elm);
      });

      if (checks) {
        return {
          type: unionType,
          val: data.val
        };
      } else {
        throw {
          message: 'Union injection did not type check.'
        };
      }
    }
  }

  // ----- Helper functions ----- //

  function isPrimitive (ty) {
    return ty === Type.Number
        || ty === Type.Boolean
        || ty === Type.String;
  }

  return {
    Number: constructPrimitive(Type.Number),
    String: constructPrimitive(Type.String),
    Boolean: constructPrimitive(Type.Boolean),
    Record: constructRecord,
    AnyType: function (ty) {
      // FIXME for union types - er, or remove since we have variables?
      if (ty.category === 'Primitive') {
        return constructPrimitive(ty);
      } else if (ty.category === 'Record') {
        return constructRecord(ty);
      } else if (ty.category === 'Union') {
        console.log('AnyType called on Union.');
      } else {
        throw new Error('AnyType called on unrecognized type category ' + ty.category);
      }
    },
    equal: equal,
    injectUnion: injectUnion
  };
});


/* Injects an untyped piece of data into a typed wrapper.
   * NOTE: injecting into a record type is unsafe!
   *
   * type    : Type
   * untyped : int | bool | string | Object
   * returns : { type: Type, val: <value> }
   */
  // function inject (type, untyped) {
  //   if (type.isPrimitive) {
  //     return constructPrimitive (type) (untyped);
  //   } else {
      
  //   }
  // }