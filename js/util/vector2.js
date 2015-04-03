
define ([ 'core/datatypes', 'core/data' ], 
        function (Type, Data) {
  var vectorType = new Type.Record([ { id: 'x'
                                     , type: Type.Number 
                                     }
                                   , { id: 'y'
                                     , type: Type.Number
                                     }]);

  var cons = Data.Record (vectorType);

  /* Adds two `Vector2`s.
  */
  var add = function (v1, v2) {
    return cons (Data.Number (v1.val.x.val + v2.val.x.val)) 
                (Data.Number (v1.val.y.val + v2.val.y.val));
  }

  return {
    Vector2: cons,
    type: vectorType,
    add: add
  };
});