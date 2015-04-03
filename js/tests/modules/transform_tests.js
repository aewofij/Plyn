define([ 'core/signals'
        , 'core/datatypes'
        , 'core/data'
        , 'core/actions'
        , 'modules/transform'
        , 'util/vector3'
        , 'util/objutil'
        ], function ( Signal, Datatype, Data, Action,
                      Transform, Vector3, ObjUtil ) {
  return {
    run: function () {
      QUnit.module("Transform");

      QUnit.test("basic transform", function (assert) {
        var xform = new Transform({ dummyField: 1 });
        var action = xform.actions[xform.componentType].placeAt;

        var origin = Data.Record (Vector3.type) 
                                 (Data.Number (0))
                                 (Data.Number (0))
                                 (Data.Number (0));
        var vec123 = Data.Record (action.argTypes[0]) 
                                 (Data.Number (1))
                                 (Data.Number (2))
                                 (Data.Number (3))
        assert.ok(Data.equal(origin, origin));
        assert.ok(Data.equal(xform.signals.Transform.position.current, origin));

        Action.trigger(action, [ vec123 ]);
        assert.ok(Data.equal(xform.signals.Transform.position.current, vec123));

        assert.throws(function () {
          Action.trigger(action, [ Data.Number (0) ]);
        });
      });
    }
  }
})