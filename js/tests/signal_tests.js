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

      QUnit.module("Signals");  
      
      QUnit.test("basic signals", function (assert) {
        var s1 = Signal.Signal(Datatype.Number, Data.Number (1));
        var s2 = new Signal.Signal(Datatype.Number, Data.Number (2));
        waitForFrame(assert, function () {
          assert.equal(s1.current.val, 1);
          assert.equal(s2.current.val, 2);

          Signal.push(s1, Data.Number (4));
        }).then(function () {
          assert.equal(s1.current.val, 4);
          assert.equal(s2.current.val, 2);

          Signal.push(s2, Data.Number (5));
        }).then(function () {
          assert.equal(s1.current.val, 4);
          assert.equal(s2.current.val, 5);
        }).end();
      });

      QUnit.test("callbacks", function (assert) {
        var s1 = new Signal.Signal(Datatype.Number, Data.Number (1));

        var state = { 
          previousVal: undefined,
          changes: 0 
        };

        waitForFrame(assert, function () {
          Signal.subscribe(s1, function (v) {
            // TODO: equality based on wrapped value _or_? primitives?
            if (!Data.equal(v, state.previousVal)) {
              state.changes++;
              state.previousVal = v;
            }
          });
        }).then(function () {
          assert.equal(state.changes, 0);
          Signal.push(s1, Data.Number (2));
        }).then(function () {
          assert.equal(state.changes, 1);
          Signal.push(s1, Data.Number (2));
        }).then(function () {
          assert.equal(state.changes, 1);
          assert.equal(state.previousVal.val, 2);

          Signal.push(s1, Data.Number (3));
        }).then(function () {
          assert.equal(state.changes, 2);
          assert.equal(state.previousVal.val, 3);

          Signal.push(s1, Data.Number (4));
        }).then(function () {
          assert.equal(state.changes, 3);
          assert.equal(state.previousVal.val, 4);
        }).end();

      });

      QUnit.test("callback unsubscribing", function (assert) {
        var s1 = new Signal.Signal(Datatype.Number, Data.Number (1));

        var state1 = { 
          previousVal: undefined,
          changes: 0 
        };
        var state2 = { 
          previousVal: undefined,
          changes: 0 
        };

        var unsub1 = Signal.subscribe(s1, function (v) {
          // TODO: equality based on wrapped value _or_? primitives?
          if (!Data.equal(v, state1.previousVal)) {
            state1.changes++;
            state1.previousVal = v;
          }
        });

        var unsub2 = Signal.subscribe(s1, function (v) {
          // TODO: equality based on wrapped value _or_? primitives?
          if (!Data.equal(v, state2.previousVal)) {
            state2.changes++;
            state2.previousVal = v;
          }
        });

        waitForFrame(assert, function () {
          Signal.push(s1, Data.Number (2));
        }).then(function () {
          Signal.push(s1, Data.Number (3));
        }).then(function () {
          Signal.push(s1, Data.Number (4));
        }).then(function () {
          assert.ok(Data.equal(s1.current, Data.Number (4)));
          assert.equal(state1.changes, 3);
          assert.equal(state1.previousVal.val, 4);
          assert.equal(state2.changes, 3);
          assert.equal(state2.previousVal.val, 4);

          unsub1();
        }).then(function () {
          assert.ok(Data.equal(s1.current, Data.Number (4)));
          assert.equal(state1.changes, 3);
          assert.equal(state1.previousVal.val, 4);
          assert.equal(state2.changes, 3);
          assert.equal(state2.previousVal.val, 4);

          Signal.push(s1, Data.Number(5));
        }).then(function () {
          assert.ok(Data.equal(s1.current, Data.Number (5)));
          assert.equal(state1.changes, 3);
          assert.equal(state1.previousVal.val, 4);
          assert.equal(state2.changes, 4);
          assert.equal(state2.previousVal.val, 5);

          unsub2();
        }).then(function () {
          assert.ok(Data.equal(s1.current, Data.Number (5)));
          assert.equal(state1.changes, 3);
          assert.equal(state1.previousVal.val, 4);
          assert.equal(state2.changes, 4);
          assert.equal(state2.previousVal.val, 5);

          Signal.push(s1, Data.Number(6));
        }).then(function () {
          assert.ok(Data.equal(s1.current, Data.Number (6)));
          assert.equal(state1.changes, 3);
          assert.equal(state1.previousVal.val, 4);
          assert.equal(state2.changes, 4);
          assert.equal(state2.previousVal.val, 5);
        }).end();
      });

      QUnit.test("basic signal reflection", function (assert) {
        var s1 = new Signal.Signal(Datatype.Number, Data.Number (1));
        var s2 = new Signal.Signal(Datatype.Number, Data.Number (2));

        waitForFrame(assert, function () {
          assert.deepEqual(s1.current, Data.Number(1));
          assert.deepEqual(s2.current, Data.Number(2));

          Signal.reflect(s1, s2);
        }).then(function () {
          Signal.push(s1, Data.Number(3));
        }).then(function () {
          assert.equal(s1.current.val, 3);
          assert.equal(s2.current.val, 2);

          Signal.push(s2, Data.Number(4));
        }).then(function () {
          assert.equal(s2.current.val, 4);
        }).then(function () {
          // hm... it takes two frames for s1 to reflect s2...
          //   4 gets pushed onto s2
          //   s2.current gets pushed onto s1
          assert.equal(s1.current.val, 4);
        }).end();
      });
    }
  };
});