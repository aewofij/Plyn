/*
Defines a basic type system.

Type ::= Primitive
       | Record Field*
       | Union Type*

Primitive ::= Number
            | String
            | Boolean

Field ::= (Identifier, Type)
*/

define([ 'util/objutil' ], function (ObjUtil) {

  var Categories = {
    Primitive: 'Primitive',
    Record: 'Record',
    Variable: 'Variable',
    Union: 'Union',
    Constructed: 'Constructed'
  }

  function Type() {}
  Type.prototype = Object.create(Object.prototype, {
      category: {
        enumerable: true,
        value: null
      }
    });

  // ----- Primitives ----- //

  var primitives = {
    Number: 'Number',
    String: 'String',
    Boolean: 'Boolean'
  };

  function PrimitiveType (primType) {
    return Object.create(PrimitiveType.prototype, {
      category: {
        enumerable: true,
        value: Categories.Primitive
      }, 
      type: {
        enumerable: true,
        value: primType
      }
    });
  }

  PrimitiveType.prototype = Object.create(Type.prototype, {
    category: {
      enumerable: true,
      value: Categories.Primitive
    }, 
    type: {
      enumerable: true,
      value: null
    }
  });


  // ----- Record types ----- //

  // RecordType : [{ id : String, type: Type }] -> Type
  function RecordType (fields) {
    // TODO: ensure that every leaf is a primitive
    // TODO: ensure that every field has both an id and a type
    return Object.create(RecordType.prototype, {
      category: {
        enumerable: true,
        value: Categories.Record
      }, 
      fields: {
        enumerable: true,
        value: fields
      }
    });
  }

  RecordType.prototype = Object.create(Type.prototype, {
    category: {
      enumerable: true,
      value: Categories.Record
    }, 
    fields: {
      enumerable: true,
      value: null
    }
  });


  // ----- Union types ----- //

  /* Creates a union type out of any number of other types. 
   *
   * var numAndBool = Union(Number, Boolean);
   * var numBoolStr = Union(Number, Boolean, String);
   *
   * returns: { category: Categories.Union
   *          , type: [Type] }
   */
  function UnionType (t1, t2) {
    var components = Array.prototype.slice.call(arguments);

    // collect non-union types
    var nonunions = components.filter(function (elm) {
      return elm.category !== Categories.Union;
    });

    // flatten union types
    var unions = components.filter(function (elm) { return elm.category === Categories.Union })
                           .map(function (elm) { return elm.types });
    unions = Array.prototype.concat.apply([], unions);

    // combine
    var typeSet = nonunions.concat(unions);

    return Object.create(UnionType.prototype, {
      category: {
        enumerable: true,
        value: Categories.Union
      }, 
      types: {
        enumerable: true,
        value: typeSet
      }
    });
  }

  UnionType.prototype = Object.create(Type.prototype, {
    category: {
      enumerable: true,
      value: Categories.Union
    }, 
    types: {
      enumerable: true,
      value: []
    }
  });


  // ----- Type variables ----- //

  /* Creates a type variable, given an identifier.
   * NB: Type variables are currently first-order only! This means that you can
   *   never reference a type variable as a refinement of some other type. (I'm
   *   pretty this should cover all uses of dynamic polymorphism.)
   *
   * returns: { category: Categories.Union
   *          , type: String }
   */
  function VariableType (identifier) {
    return Object.create(VariableType.prototype, {
      category: {
        enumerable: true,
        value: Categories.Variable
      }, 
      id: {
        enumerable: true,
        value: identifier
      }
    });
  }

  VariableType.prototype = Object.create(Type.prototype, {
    category: {
      enumerable: true,
      value: Categories.Variable
    }, 
    id: {
      enumerable: true,
      value: null
    }
  });


  // // TODO: test me
  // // Adds a label to an existing type. Useful in pattern matching.
  // function ConstructedType (label, innerType) {
  //   return Object.create(Type.prototype, {
  //     category: {
  //       enumerable: true,
  //       value: Categories.Constructed
  //     },
  //     // label of constructed type, used in pattern matching
  //     label: {
  //       enumerable: true,
  //       value: label
  //     },
  //     // type of data contained in this constructed type
  //     field: {
  //       enumerable: true,
  //       value: innerType
  //     }
  //   });
  // }

  // ConstructedType.prototype = Object.create(Type.prototype, {
  //   category: {
  //     enumerable: true,
  //     value: Categories.Constructed
  //   },
  //   // label of constructed type, used in pattern matching
  //   label: {
  //     enumerable: true,
  //     value: null
  //   },
  //   // type of data contained in this constructed type
  //   field: {
  //     enumerable: true,
  //     value: null
  //   }
  // });

  // ----- Functions ----- //

  /* Returns the field in the specified record which 
   *   has the specified identifier.
   *
   * recType : { fields : [{ id: String, type: Type }] }
   * fieldId : String
   * returns : { id: String, type: Type }
   */
  function getFieldInfo (recType, fieldId) {
    if (recType.category === Categories.Record) {
      var filtered = recType.fields.filter(function (elm) {
        return elm.id === fieldId;
      });

      if (filtered.length > 0) {
        // just return the first instance
        return filtered[0];
      }
    } 
    // else if (recType.category === Categories.Union) {
    //   // TODO: uncertain what to do here. can this exist? what is it used for?
    // }
  }

  /* Checks if `subType` is a refinement type of `superType` - 
   *  that is, if `subType` contains all fields of `superType`.
   */
  function isRefinement (subType, superType) {
    return solve([refined(subType, superType)]).checks;
  }

  /* Solves a set of constraints, returning an object containing a boolean noting if
   *   the set is solvable (`checks`), and a list of types for all type variables if solvable.
   *
   * returns: { checks : Boolean
   *          , variables : { <id> : Type, [...] } }
   */
  function solve (constraints) {
    return solveHelper(constraints, { variables: {} });

    function solveHelper (cts, acc) {
      if (cts.length === 0) {
        return {
          checks: true,
          get: buildGetFn(acc.variables)
        };
      } else {
        var hd = cts[0];
        var tl = cts.slice(1);

        if (hd.refined.category === Categories.Variable) {
          throw new Error('Attempted to refine a type variable.');
        }

        if (hd.base.category === Categories.Primitive) {
          if (hd.refined.category === Categories.Primitive) {
            if (hd.base.type === hd.refined.type) {
              return solveHelper(tl, acc);
            } else {
              return {
                checks: false
              };
            }
          } 
          else if (hd.refined.category === Categories.Union) {
            if (hd.refined.types.some(function (elm) { return elm.type === hd.base.type })) {
              return solveHelper(tl, acc);
            } else {
              return {
                checks: false
              };
            }
          } 
          else if (hd.refined.category === Categories.Record) {
            return {
              checks: false
            };
          }
        } 

        // else if (hd.base.category === Categories.Union) {
        //   if (hd.refined.category === Categories.Primitive) {
        //     var newConstraints = hd.base.types.map(function (elm) {
        //       return refined(hd.refined, elm);
        //     });
        //     return solveHelper(tl.concat(newConstraints), acc);
        //   }
        //   else if (hd.refined.category === Categories.Union) {
        //     var newConstraints = hd.base.types.map(function (elm) {
        //       return refined(hd.refined, elm);
        //     });
        //     return solveHelper(tl.concat(newConstraints), acc);
        //   }
        //   else if (hd.refined.category === Categories.Record) {
        //     // same as primitive case
        //     var newConstraints = hd.base.types.map(function (elm) {
        //       return refined(hd.refined, elm);
        //     });
        //     return solveHelper(tl.concat(newConstraints), acc);
        //   }
        // } 

        /* Different way of thinking about unions: types which are part of the union can be
         *   considered functionally "refinements" of the union type.
         * If a union type is used as a specification, then the implementation must cover all
         *   possible cases for that union type. Thus, if only a single case is presented, that
         *   case must be valid.
         * However, this breaks the niceness of "if a is refined of b, and b is refined of a, then a = b".
         */
        else if (hd.base.category === Categories.Union) {
          if (hd.refined.category === Categories.Primitive) {
            var potentials = hd.base.types.map(function (elm) {
              return solveHelper([refined(hd.refined, elm)].concat(tl), acc);
            }).filter(function (elm) { 
              return elm.checks; 
            });

            if (potentials.length === 0) {
              return {
                checks: false
              };
            } else {
              return potentials[0];
            }
          }
          else if (hd.refined.category === Categories.Union) {
            var newConstraints = hd.base.types.map(function (elm) {
              return refined(hd.refined, elm);
            });
            return solveHelper(tl.concat(newConstraints), acc);
          }
          else if (hd.refined.category === Categories.Record) {
            var potentials = hd.base.types.map(function (elm) {
              return solveHelper([refined(hd.refined, elm)].concat(tl), acc);
            }).filter(function (elm) { 
              return elm.checks; 
            });

            if (potentials.length === 0) {
              return {
                checks: false
              };
            } else {
              return potentials[0];
            }
          }
        } 

        else if (hd.base.category === Categories.Record) {
          if (hd.refined.category === Categories.Primitive) {
            return {
              checks: false
            };
          } 
          else if (hd.refined.category === Categories.Union) {
            var passed = hd.refined.types.map(function (elm) {
              return solveHelper(tl.concat([refined(elm, hd.base)]), acc);
            }).filter(function (elm) {
              return elm.checks;
            });

            if (passed.length === 0) {
              return {
                checks: false
              };
            } else {
              return passed[0];
            }
          }
          else if (hd.refined.category === Categories.Record) {
            var newConstraints = [];
            for (var i = hd.base.fields.length - 1; i >= 0; i--) {
              var f = hd.base.fields[i];
              var corresponding = hd.refined.fields.filter(function (elm) {
                return elm.id === f.id;
              });

              if (corresponding.length === 0) {
                // missing field in refined type
                return {
                  checks: false
                };
              } else {
                newConstraints.push(refined(corresponding[0].type, f.type));
              }
            };

            return solveHelper(tl.concat(newConstraints), acc);
          }
        } 

        else if (hd.base.category === Categories.Variable) {
          var newBindings = checkConstraint(hd, acc);
          if (newBindings !== null) {
            return solveHelper(tl, newBindings);
          } else {
            return {
              checks: false
            };
          }
        }
      }
    }

    // checks the given constraint against a binding set
    // returns the updated binding set, or `null` if constraint is inconsistent with bindings
    function checkConstraint (constraint, bindings) {
      // (refined is non-variable, base is variable)
      // if `bindings` has an entry for this type variable already...
      if (bindings.variables.hasOwnProperty(constraint.base.id)) {
        // if `refined` is less refined than the existing binding...
        if (isRefinement(bindings.variables[constraint.base.id], constraint.refined)) {
          // ... use it instead. (we want least-constrained bindings.)
          // TODO: this could probably be changed to simply mutating `bindings` and be fine / faster.
          var newVars = {};
          newVars[constraint.base.id] = constraint.refined; // to get around evaluated key in obj literal

          return ObjUtil.extend(bindings, { variables: newVars });
        } else if (isRefinement(constraint.refined, bindings.variables[constraint.base.id])) {
          // if `refined` is more refined than the existing binding,
          //   set is still consistent but remove `constraint` and move on.
          return bindings;
        } else {
          // if neither direction of the relation holds, then we have an inconsistency.
          // TODO: (... or a union type...)
          return null;
        }
      } else {
        // otherwise, just make binding
        var newVars = {};
        newVars[constraint.base.id] = constraint.refined; // to get around evaluated key in obj literal

        return ObjUtil.extend(bindings, { variables: newVars });
      }
    }
  }

  /* Creates a constraint which says that `t1` is a refined type of `t2`.
   *
   * returns: { refined: Type, base: Type }
   */
  function refined (t1, t2) {
    return {
      refined: t1,
      base: t2
    };
  }

  // ----- Helpers ----- //

  // buildGetFn : { id: Type } -> (Type -> Type)
  function buildGetFn (bindings) {
    return function getter (ty) {
      if (ty.category === Categories.Variable) {
        var result = bindings[ty.id];
        if (result === undefined) {
          return ty;
        } else {
          return result;
        }
      } else if (ty.category === Categories.Union) {
        return UnionType.apply(this, ty.types.map(getter));
      } else if (ty.category === Categories.Record) {
        return RecordType.call(this, ty.fields.map(function (f) {
          return { 
            id: f.id, 
            type: getter(f.type) 
          };
        }));
      } else if (ty.category === Categories.Primitive) {
        return ty;
      }
    }
  }

  // ----- RequireJS exports ----- //

  return {
    Number: new PrimitiveType(primitives.Number),
    String: new PrimitiveType(primitives.String),
    Boolean: new PrimitiveType(primitives.Boolean),
    Record: RecordType,
    Union: UnionType,
    Variable: VariableType,
    getFieldInfo: getFieldInfo,
    isRefinement: isRefinement,
    solve: solve,
    refined: refined
  }
});