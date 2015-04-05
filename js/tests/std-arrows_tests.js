define([ 'core/signals'
       , 'core/datatypes'
       , 'core/data'
       , 'core/actions'
       , 'core/arrow'
       , 'arrows/std-arrows'
       , 'modules/transform'
       , 'util/vector2'
       , 'util/objutil'
       ], function ( Signal, Type, Data, Action, Arrow,
                     StdArrows, Transform, Vector2, ObjUtil ) {
  return {
    run: function () {
      QUnit.module('Standard arrows');

      QUnit.test('numberExpression', function (assert) {
        var s1 = Signal.Signal(Type.Number, Data.Number(0));

        // var addOne = StdArrows.numberExpression(function (v) {
        //   return v + 1;
        // });
        var addOne = StdArrows.numberExpression();
        addOne.setParameter('expression', function (v) {
          return v + 1;
        });

        var addOneInstance = addOne.plug(s1);


        Signal.push(s1, Data.Number(1));
        assert.deepEqual(Signal.pull(addOneInstance.signal),
                         Data.Number(2));
        Signal.push(s1, Data.Number(5));
        assert.deepEqual(Signal.pull(addOneInstance.signal),
                         Data.Number(6));

        addOne.setParameter('expression', function (v) {
          return v + 2;
        });

        Signal.push(s1, Data.Number(1));
        assert.deepEqual(Signal.pull(addOneInstance.signal),
                         Data.Number(3));
        Signal.push(s1, Data.Number(5));
        assert.deepEqual(Signal.pull(addOneInstance.signal),
                         Data.Number(7));
      });

      QUnit.test('numberExpression, parity > 1', function (assert) {
        var s1 = Signal.Signal(Type.Number, Data.Number(0));
        var s2 = Signal.Signal(Type.Number, Data.Number(0));

        var addOne = StdArrows.numberExpression();
        addOne.setParameter('expression', function (v1, v2) {
          return v1 + v2;
        });

        var addOneInstance = addOne.plug(s1, s2);

        Signal.push(s1, Data.Number(1));
        Signal.push(s2, Data.Number(2));
        assert.deepEqual(Signal.pull(addOneInstance.signal),
                         Data.Number(3));
        Signal.push(s1, Data.Number(5));
        assert.deepEqual(Signal.pull(addOneInstance.signal),
                         Data.Number(7));
      });

      QUnit.test('vectorExpression', function (assert) {
        var s1 = Signal.Signal(Vector2.type);

        var scale = StdArrows.vectorExpression();
        var done = assert.async();
        Object.observe(scale.inputTypes, function () {
          var scaleInst = scale.plug(s1);

          Signal.push(s1, Vector2.Vector2 (Data.Number (2)) (Data.Number (4)));
          assert.deepEqual(Signal.pull(scaleInst.signal),
                           Vector2.Vector2 (Data.Number (1)) (Data.Number (2)));
          done();
        });
        scale.setParameter('expression', function (vec) {
                               return {
                                 x: vec.x * 0.5,
                                 y: vec.y * 0.5
                               };
                             });
      });

      QUnit.test('merge', function (assert) {
        var s1 = new Signal.Signal(Type.Number, Data.Number(0));
        var s2 = new Signal.Signal(Type.Boolean, Data.Boolean(true));

        var arrowInfo = StdArrows.merge.plug(s1, s2);

        assert.deepEqual(arrowInfo.signal.type, Type.Union(s1.type, s2.type));
        // arrowInfo.pull();

        Signal.push(s1, Data.Number(1));
        assert.deepEqual(Signal.pull(arrowInfo.signal), 
                         Data.Number(1));
        Signal.push(s2, Data.Boolean(true));
        assert.deepEqual(Signal.pull(arrowInfo.signal), 
                         Data.Boolean(true));
      });

      // QUnit.test('foldp', function (assert) {
      //   var s1 = new Signal.Signal(Type.Number, Data.Number(1));

      //   var sump = StdArrows.foldp();
      //   sump.setParameter('initialState', Data.Number(0));
      //   sump.setParameter('returnType', Type.Number);
      //   sump.setParameter('transitionFunction', function (v, acc) {
      //     return Data.Number (v.val + acc.val);
      //   });

      //   var arrowInfo = sump.plug(s1);

      //   // foldp does not look at any signal values prior to plugging
      //   assert.deepEqual(Signal.pull(arrowInfo.signal), Data.Number(0));

      //   Signal.push(s1, Data.Number(0));
      //   assert.deepEqual(Signal.pull(arrowInfo.signal), Data.Number(0));

      //   Signal.push(s1, Data.Number(1));
      //   assert.deepEqual(Signal.pull(arrowInfo.signal), Data.Number(1));

      //   Signal.push(s1, Data.Number(2));
      //   assert.deepEqual(Signal.pull(arrowInfo.signal), Data.Number(3));

      //   Signal.push(s1, Data.Number(3));
      //   assert.deepEqual(Signal.pull(arrowInfo.signal), Data.Number(6));
      // });

      QUnit.test('pushTo', function (assert) {
        var s1 = Signal.Signal(Type.Number, Data.Number(1));
        var s2 = Signal.Signal(Type.Number, Data.Number(0));

        var pushTo = StdArrows.pushTo();
        pushTo.setParameter('signal', s2);
        var inst = pushTo.plug(s1);

        inst.pull();

        assert.deepEqual(Signal.pull(s2), Signal.pull(s1));

        Signal.push(s1, Data.Number(5));
        assert.deepEqual(Signal.pull(s2), Signal.pull(s1));

        Signal.push(s1, Data.Number(-1));
        assert.deepEqual(Signal.pull(s2), Signal.pull(s1));
      })

      QUnit.test('filterRepeats', function (assert) {
        var s1 = new Signal.Signal(Type.Number);

        var filterArrow = StdArrows.filterRepeats.plug(s1);

        var i = 0;
        Signal.subscribe(filterArrow.signal, function (v) { i++ });

        assert.equal(i, 0);

        Signal.push(s1, Data.Number (1));
        assert.equal(i, 1);

        Signal.push(s1, Data.Number (1));
        assert.equal(i, 1);

        Signal.push(s1, Data.Number (1));
        assert.equal(i, 1);

        Signal.push(s1, Data.Number (0));
        assert.equal(i, 2);

        Signal.push(s1, Data.Number (1));
        assert.equal(i, 3)

        Signal.push(s1, Data.Number (10));
        assert.equal(i, 4);

        // doesn't leak state
        var s2 = Signal.Signal(Type.Number);
        var filterArrow2 = StdArrows.filterRepeats.plug(s2);

        var i2 = 0;
        Signal.subscribe(filterArrow2.signal, function (v) { i2++ });

        assert.equal(i2, 0);

        Signal.push(s1, Data.Number(1));
        assert.equal(i2, 0);

        Signal.push(s2, Data.Number(10));
        assert.equal(i2, 1);

        Signal.push(s1, Data.Number(1));
        assert.equal(i2, 1);

        Signal.push(s2, Data.Number(1));
        assert.equal(i2, 2);
      });

      QUnit.test('filterRepeats on unions', function (assert) {
        var s = new Signal.Signal(Type.Union(Type.Number, Type.Boolean));

        var filterArrow = StdArrows.filterRepeats.plug(s);

        var i = 0;
        Signal.subscribe(filterArrow.signal, function (v) { i++ });

        assert.equal(i, 0);

        Signal.push(s, Data.Number (1));
        assert.equal(i, 1);

        Signal.push(s, Data.Boolean (true));
        assert.equal(i, 2);

        Signal.push(s, Data.Boolean (true));
        assert.equal(i, 2);

        Signal.push(s, Data.Number (1));
        assert.equal(i, 3);
        
        Signal.push(s, Data.Number (1));
        assert.equal(i, 3)

        Signal.push(s, Data.Boolean (true));
        assert.equal(i, 4);
      });

      QUnit.test('matchType', function (assert) {
        var uSig = Signal.Signal(Type.Union(Type.Number, Type.String));

        var matchArrow = StdArrows.matchType();
        matchArrow.setParameter('type', Type.Number);
        matchArrow.setParameter('defaultValue', Data.Number(0))
        var matchNumber = matchArrow.plug(uSig);

        Signal.push(uSig, Data.Number(3));
        assert.deepEqual(Signal.pull(matchNumber.signal), Data.Number(3));

        Signal.push(uSig, Data.String('a string'));
        assert.deepEqual(Signal.pull(matchNumber.signal), Data.Number(3));

        Signal.push(uSig, Data.Number(4));
        assert.deepEqual(Signal.pull(matchNumber.signal), Data.Number(4));
      });

      QUnit.test('buildRecord', function (assert) {
        var fooSig = Signal.Signal(Type.Number, Data.Number(1));
        var barSig = Signal.Signal(Type.Boolean, Data.Boolean(false));
        var recType = Type.Record ([{ id: 'foo', type: Type.Number },
                                    { id: 'bar', type: Type.Boolean }]);
        var brArrow = StdArrows.buildRecord();
        brArrow.setParameter('record type', recType);
        var br = brArrow.plug(fooSig, barSig);

        Signal.push(fooSig, Data.Number (2));
        Signal.push(barSig, Data.Boolean (true));

        assert.deepEqual(Signal.pull(br.signal), 
                         Data.Record (recType) 
                                     (Data.Number (2))
                                     (Data.Boolean (true)));

        Signal.push(barSig, Data.Boolean (false));
        assert.deepEqual(Signal.pull(br.signal), 
                         Data.Record (recType) 
                                     (Data.Number (2))
                                     (Data.Boolean (false)));
      });

      QUnit.test('fieldAccess', function (assert) {
        var recType1 = Type.Record ([{ id: 'foo', type: Type.Number },
                                     { id: 'bar', type: Type.Boolean }]);

        var recType2 = Type.Record ([{ id: 'foo', type: Type.Boolean }]);

        var recSig1 = Signal.Signal (recType1);
        var recSig2 = Signal.Signal (recType2);

        var getFooArrow = StdArrows.fieldAccess();
        getFooArrow.setParameter('field id', 'foo');
        var getFoo = getFooArrow.plug(recSig1);

        Signal.push(recSig1, Data.Record (recType1) 
                                         (Data.Number (1)) 
                                         (Data.Boolean (false)));
        assert.deepEqual(Signal.pull(getFoo.signal), 
                         Data.Number (1));

        Signal.push(recSig1, Data.Record (recType1) 
                                         (Data.Number (1)) 
                                         (Data.Boolean (true)));
        assert.deepEqual(Signal.pull(getFoo.signal), 
                         Data.Number (1));

        Signal.push(recSig1, Data.Record (recType1) 
                                         (Data.Number (2)) 
                                         (Data.Boolean (false)));
        assert.deepEqual(Signal.pull(getFoo.signal), 
                         Data.Number (2));


        var getFoo2 = getFooArrow.plug(recSig2);
        Signal.push(recSig2, Data.Record (recType2) (Data.Boolean (false)));
        assert.deepEqual(Signal.pull(getFoo2.signal), 
                         Data.Boolean (false));

        Signal.push(recSig2, Data.Record (recType2) (Data.Boolean (true)));
        assert.deepEqual(Signal.pull(getFoo2.signal), 
                         Data.Boolean (true));
      });
    }
  }
})