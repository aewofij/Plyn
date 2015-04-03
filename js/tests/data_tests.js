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
      QUnit.module("Data");

      QUnit.test("primitive constructors", function (assert) {
        var num1 = Data.Number (1);
        var num2 = Data.Number (2);
        var str = Data.String ('hello');
        var bool = Data.Boolean (true);

        assert.equal(num1.val + 1, num2.val);
        assert.equal(str.val, 'hello');
        assert.equal(bool.val, true);

        assert.equal(Datatype.isRefinement(num1.type, num2.type), true);
        assert.equal(Datatype.isRefinement(num1.type, str.type), false);
        assert.equal(Datatype.isRefinement(str.type, num1.type), false);
        assert.equal(Datatype.isRefinement(num1.type, bool.type), false);
        assert.equal(Datatype.isRefinement(bool.type, num1.type), false);
      });

      QUnit.test("record constructors", function (assert) {
        var fty = Datatype.Record([ { id: 'foo', type: Datatype.Number } ]);
        var f_instance1 = Data.Record (fty) (Data.Number (3));
        var f_instance2 = Data.Record (fty) (Data.Number (3));

        var Fcons = Data.Record (fty);
        var f_instance1_ = Fcons (Data.Number (3));
        var f_instance2_ = Fcons (Data.Number (3));

        assert.equal(Data.equal(f_instance1, f_instance1_), true);
        assert.equal(Data.equal(f_instance2, f_instance2_), true);

        assert.equal(f_instance1.type, fty);
        assert.equal(f_instance2.type, fty);
        assert.equal(Data.equal(f_instance1.val.foo, Data.Number(3)), true);
        assert.equal(Data.equal(f_instance2.val.foo, Data.Number(3)), true);
      });

      QUnit.test("multi-field record constructors", function (assert) {
        var fty = Datatype.Record([ { id: 'foo', type: Datatype.Number } ]);
        var f_instance1 = Data.Record (fty) (Data.Number (3));
        var fbty = Datatype.Record([ { id: 'foo', type: Datatype.Number }
                                   , { id: 'bar', type: Datatype.String } ])
        var FBcons = Data.Record (fbty);
        var fb_instance = FBcons (Data.Number (5)) (Data.String ('barField'));

        assert.equal(f_instance1.type, fty);
        assert.equal(Data.equal(f_instance1.val.foo, Data.Number(3)), true);

        assert.equal(fb_instance.type, fbty);
        // assert.equal(Data.equal(fb_instance.val.foo, Data.Number(5)), true);
        // assert.equal(Data.equal(fb_instance.val.bar, Data.String('barField')), true);

        assert.deepEqual(fb_instance.val.foo, Data.Number(5));
        assert.deepEqual(fb_instance.val.bar, Data.String('barField'));

        assert.equal(Datatype.isRefinement(fb_instance.type, f_instance1.type), true);

        var threefieldcons = Datatype.Record ([ { id: 'one', type: Datatype.Number }
                                              , { id: 'two', type: Datatype.String }
                                              , { id: 'thr'
                                                , type: Datatype.Record ([{ id: 'inner'
                                                                          , type: Datatype.Number }])}]);
        var threefield = Data.Record (threefieldcons) (Data.Number (1))
                                                      (Data.String ('strung'))
                                                      (Data.Record (Datatype.Record ([{ id: 'inner'
                                                                                      , type: Datatype.Number }]))
                                                                                    (Data.Number (2)));
        // assert.ok(Data.equal(threefield.val.one, Data.Number(1)));
        // assert.ok(Data.equal(threefield.val.two, Data.String('strung')));
        // assert.ok(Data.equal(threefield.val.thr, Data.Record (Datatype.Record ([{ id: 'inner'
        //                                                                         , type: Datatype.Number }]))
        //                                                                       (Data.Number (2))));

        assert.deepEqual(threefield.val.one, Data.Number(1));
        assert.deepEqual(threefield.val.two, Data.String('strung'));
        assert.deepEqual(threefield.val.thr, Data.Record (Datatype.Record ([{ id: 'inner'
                                                                                , type: Datatype.Number }]))
                                                                              (Data.Number (2)));

      });

      QUnit.test("simple record equality", function (assert) {
        var fty = Datatype.Record([ { id: 'foo', type: Datatype.Number } ]);
        var fcons = Data.Record (fty);
        var f_instance1 = fcons (Data.Number (3));
        var f_instance2 = fcons (Data.Number (3));
        var f_instance3 = fcons (Data.Number (5));

        assert.equal(Data.equal(f_instance1, f_instance2), true);
        assert.equal(Data.equal(f_instance2, f_instance1), true);
        assert.equal(Data.equal(f_instance1, f_instance3), false);
        assert.equal(Data.equal(f_instance2, f_instance3), false);

        var fbty = Datatype.Record([ { id: 'foo', type: Datatype.Number }
                                       , { id: 'bar', type: Datatype.String } ])
        var FBcons = Data.Record (fbty);
        var fb_instance1 = Data.Record (fbty) 
                                       (Data.Number (5)) 
                                       (Data.String ('barField'));
        var fb_instance2 = Data.Record (fbty) 
                                       (Data.Number (5)) 
                                       (Data.String ('barField'));
        var fb_instance3 = Data.Record (fbty) 
                                       (Data.Number (5)) 
                                       (Data.String ('notBarField'));
        var fb_instance4 = Data.Record (fbty) 
                                       (Data.Number ('5')) 
                                       (Data.String ('barField'));

        assert.ok(Data.equal(fb_instance1, fb_instance2));
        assert.ok(Data.equal(fb_instance2, fb_instance1));
        assert.ok(!Data.equal(fb_instance1, fb_instance3));
        // FIXME: not picking up inner type differences (5 == '5')
        // assert.ok(!Data.equal(fb_instance1, fb_instance4));
        assert.ok(!Data.equal(fb_instance2, fb_instance3));
        // assert.ok(!Data.equal(fb_instance2, fb_instance4));
        assert.ok(!Data.equal(fb_instance3, fb_instance2));
        assert.ok(!Data.equal(fb_instance4, fb_instance2));
      }); 
    }
  };
});