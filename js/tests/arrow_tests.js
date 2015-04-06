define([ 'core/signals'
        , 'core/datatypes'
        , 'core/data'
        , 'core/actions'
        , 'core/arrow'
        , 'modules/transform'
        , 'util/vector3'
        , 'util/objutil'
        ], function ( Signal, Datatype, Data, Action, Arrow,
                      Transform, Vector3, ObjUtil ) {
  return {
    run: function () {
      // Sugar for asynchronous testing, 
      //   based off of `requestAnimationFrame`.
      function waitForFrame (asrt, proc) {
        return {
          procQueue: [proc],

          then: function (nextProc) {
            this.procQueue.push(nextProc);
            return this;
          },

          end: function () {
            var self = this;
            var done = asrt.async();
            window.requestAnimationFrame(function () {
              (self.procQueue.shift())();

              if (self.procQueue.length > 0) {
                self.end();
              }

              done();
            });
          }
        };
      }

      QUnit.module('Arrows');

      QUnit.test('plugging', function (assert) {
        var add = Arrow.EventArrow('add',
                                   [],
                                   [ Datatype.Number
                                   , Datatype.Number ],
                                   Datatype.Number,
                                   function (v1, v2) {
                                     return Data.Number (v1.val + v2.val);
                                   });
        var s1 = new Signal.Signal(Datatype.Number, Data.Number(1));
        var s2 = new Signal.Signal(Datatype.Number, Data.Number(2));
        var arrowInfo = add.plug(s1, s2);

        // assert.ok(Data.equal(arrowInfo.signal.current, Data.Number(3)));

        waitForFrame(assert, function () {
          Signal.push(s1, Data.Number(4));
        }).then(function () {
          assert.ok(Data.equal(Signal.pull(arrowInfo.signal), Data.Number(6)));

          Signal.push(s1, Data.Number(3));
        }).then(function () {
          assert.ok(Data.equal(Signal.pull(arrowInfo.signal), Data.Number(5)));

          Signal.push(s2, Data.Number(3));
        }).then(function () {
          assert.ok(Data.equal(Signal.pull(arrowInfo.signal), Data.Number(6)));

          Signal.push(s1, Data.Number(3));
        }).then(function () {
          assert.ok(Data.equal(Signal.pull(arrowInfo.signal), Data.Number(6)));

          assert.deepEqual(arrowInfo.inputs[0], s1);
          assert.deepEqual(arrowInfo.inputs[1], s2);
        }).end();
      });

      QUnit.test('unplugging', function (assert) {
        var add = Arrow.EventArrow('add',
                                   [],
                                   [ Datatype.Number
                                   , Datatype.Number ],
                                   Datatype.Number,
                                   function (v1, v2) {
                                     return Data.Number(v1.val + v2.val);
                                   });
        var s1 = new Signal.Signal(Datatype.Number, Data.Number(1));
        var s2 = new Signal.Signal(Datatype.Number, Data.Number(2));
        var arrowInfo = add.plug(s1, s2);

        // assert.ok(Data.equal(arrowInfo.signal.current, Data.Number(3)));

        Signal.push(s1, Data.Number(4));
        assert.ok(Data.equal(arrowInfo.signal.current, Data.Number(6)));

        arrowInfo.unplug();  

        Signal.push(s1, Data.Number(0));
        assert.ok(Data.equal(arrowInfo.signal.current, Data.Number(6)));
      });

      QUnit.test('polymorphic arrows', function (assert) {
        var identity = Arrow.EventArrow('identity',
                                        [],
                                        [ Datatype.Variable ('a') ],
                                        Datatype.Variable('a'),
                                        function (v) {
                                           return v;
                                        });
        var s1 = new Signal.Signal(Datatype.Number, Data.Number(1));
        var arrowInfo = identity.plug(s1);

        assert.deepEqual(arrowInfo.signal.type, Datatype.Number);
        Signal.push(s1, Data.Number(2));

        assert.deepEqual(Signal.pull(arrowInfo.signal), Data.Number(2));
        assert.ok(true);
      });
    }
  }
})