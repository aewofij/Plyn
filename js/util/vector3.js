
define ([ 'core/datatypes' ], function (Type) {
  var vectorType = new Type.Record([ { id: 'x'
                                     , type: Type.Number 
                                     }
                                   , { id: 'y'
                                     , type: Type.Number
                                     }
                                   , { id: 'z'
                                     , type: Type.Number
                                     }]);

  return {
    type: vectorType
  };
});