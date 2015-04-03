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
      QUnit.module("Actions");

      QUnit.test("basic actions", function (assert) {
        var sig = new Signal.Signal(Datatype.Number, (Data.Number (0)));
        var incr = new Action.Action([], function () {
          Signal.push(sig, Data.Number (sig.current.val + 1));
        });

        Action.trigger(incr, []);

        assert.ok(Data.equal(sig.current, Data.Number(1)));
      });

      QUnit.test("basic actions (parameterized)", function (assert) {
        var sig = new Signal.Signal(Datatype.Number, (Data.Number (0)));
        var add = new Action.Action([Datatype.Number], function (v) {
          Signal.push(sig, Data.Number (sig.current.val + v));
        });

        Action.trigger(add, [Data.Number(3)]);
        assert.ok(Data.equal(sig.current, Data.Number(3)));
        Action.trigger(add, [Data.Number(2)]);
        assert.ok(Data.equal(sig.current, Data.Number(5)));
      });
    }
  }
})