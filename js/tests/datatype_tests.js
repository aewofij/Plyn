define([ 'core/signals'
        , 'core/datatypes'
        , 'core/data'
        , 'core/actions'
        , 'modules/transform'
        , 'util/vector3'
        , 'util/objutil'
        ], function ( Signal, Type, Data, Action,
                      Transform, Vector3, ObjUtil ) {
  return {
    run: function () {
      QUnit.module("Types");

      QUnit.test("making primitive types", function (assert) {
        var numType = Type.Number;
        var strType = Type.String;
        var boolType = Type.Boolean;

        assert.equal(numType.type, Type.Number.type);
        assert.equal(strType.type, Type.String.type);
        assert.equal(boolType.type, Type.Boolean.type);

        assert.notEqual(numType.type, strType.type);
        assert.notEqual(numType.type, boolType.type);

        assert.notEqual(strType.type, numType.type);
        assert.notEqual(strType.type, boolType.type);

        assert.notEqual(boolType.type, strType.type);
        assert.notEqual(boolType.type, numType.type);
      });

      QUnit.test("making record types", function (assert) {
        var r1 = new Type.Record([ { id: 'foo', type: Type.Number }
                                     , { id: 'bar', type: Type.String } ]);
        var r2 = new Type.Record([ { id: 'boo', type: Type.Boolean }
                                     , { id: 'far', type: r1 } ]);

        assert.equal(Type.getFieldInfo(r1, 'foo').type, Type.Number);
        assert.equal(Type.getFieldInfo(r1, 'bar').type, Type.String);

        assert.equal(Type.getFieldInfo(r2, 'boo').type, Type.Boolean);
        assert.equal(Type.getFieldInfo(r2, 'far').type, r1);

        assert.equal(Type.getFieldInfo(Type.getFieldInfo(r2, 'far').type, 'foo').type, 
                     Type.getFieldInfo(r1, 'foo').type);
        assert.equal(Type.getFieldInfo(Type.getFieldInfo(r2, 'far').type, 'bar').type, 
                     Type.getFieldInfo(r1, 'bar').type);
      });

      QUnit.test("primitive subtype identities", function (assert) {
        assert.equal(Type.isRefinement(Type.Number, Type.Number), true);
        assert.equal(Type.isRefinement(Type.String, Type.String), true);
        assert.equal(Type.isRefinement(Type.Boolean, Type.Boolean), true);
      });

      QUnit.test("record subtype identities", function (assert) {
        var fooRec = new Type.Record([ { id: 'foo', type: Type.Number } ]);
        var barRec = new Type.Record([ { id: 'bar', type: Type.String } ]);

        var r2 = new Type.Record([ { id: 'foo', type: Type.Number }
                                     , { id: 'bar', type: Type.String } ]);
        var r3 = new Type.Record([ { id: 'foo', type: Type.Boolean }
                                     , { id: 'bar', type: Type.String } ]);

        assert.equal(Type.isRefinement(fooRec, fooRec), true);
        assert.equal(Type.isRefinement(barRec, barRec), true);
        assert.equal(Type.isRefinement(r2, r2), true);
        assert.equal(Type.isRefinement(r3, r3), true);
      });

      QUnit.test("primitive subtype sanity", function (assert) {
        assert.equal(Type.isRefinement(Type.Number, Type.String), false);
        assert.equal(Type.isRefinement(Type.Number, Type.Boolean), false);

        assert.equal(Type.isRefinement(Type.String, Type.Number), false);
        assert.equal(Type.isRefinement(Type.String, Type.Boolean), false);

        assert.equal(Type.isRefinement(Type.Boolean, Type.Number), false);
        assert.equal(Type.isRefinement(Type.Boolean, Type.String), false);
      });

      QUnit.test("record subtyping", function (assert) {
        var fooRec = new Type.Record([ { id: 'foo', type: Type.Number } ]);
        var barRec = new Type.Record([ { id: 'bar', type: Type.String } ]);

        var r2 = new Type.Record([ { id: 'foo', type: Type.Number }
                                 , { id: 'bar', type: Type.String } ]);
        var r3 = new Type.Record([ { id: 'foo', type: Type.Boolean }
                                 , { id: 'bar', type: Type.String } ]);

        assert.equal(Type.isRefinement(fooRec, barRec), false);
        assert.equal(Type.isRefinement(barRec, fooRec), false);

        assert.equal(Type.isRefinement(r2, fooRec), true);
        assert.equal(Type.isRefinement(r2, barRec), true);
        assert.equal(Type.isRefinement(fooRec, r2), false);
        assert.equal(Type.isRefinement(barRec, r2), false);

        assert.equal(Type.isRefinement(r3, fooRec), false);
        assert.equal(Type.isRefinement(r3, barRec), true);
        assert.equal(Type.isRefinement(fooRec, r3), false);
        assert.equal(Type.isRefinement(barRec, r3), false);

        assert.equal(Type.isRefinement(r2, r3), false);
        assert.equal(Type.isRefinement(r3, r2), false);
      });

      QUnit.module('Advanced types');

      QUnit.test('primitive union types', function (assert) {
        var boolAndNum = Type.Union (Type.Boolean, Type.Number);
        var numAndBool = Type.Union (Type.Number, Type.Boolean);

        assert.ok(Type.isRefinement(boolAndNum, Type.Number));
        assert.ok(Type.isRefinement(boolAndNum, Type.Boolean));
        assert.ok(!Type.isRefinement(boolAndNum, Type.String));
        // assert.ok(!Type.isRefinement(Type.Number, boolAndNum));
        // assert.ok(!Type.isRefinement(Type.Boolean, boolAndNum));

        // new union paradigm
        assert.ok(Type.isRefinement(Type.Number, boolAndNum));
        assert.ok(Type.isRefinement(Type.Boolean, boolAndNum));

        assert.ok(Type.isRefinement(numAndBool, Type.Number));
        assert.ok(Type.isRefinement(numAndBool, Type.Boolean));
        assert.ok(!Type.isRefinement(numAndBool, Type.String));
        // assert.ok(!Type.isRefinement(Type.Number, numAndBool));
        // assert.ok(!Type.isRefinement(Type.Boolean, numAndBool));

        assert.ok(Type.isRefinement(Type.Number, numAndBool));
        assert.ok(Type.isRefinement(Type.Boolean, numAndBool));

        assert.ok(Type.isRefinement(numAndBool, boolAndNum));
        assert.ok(Type.isRefinement(boolAndNum, numAndBool));

        var boolAndString = Type.Union (Type.Boolean, Type.String);
        var stringAndBool = Type.Union (Type.String, Type.Boolean);

        assert.ok(Type.isRefinement(boolAndString, Type.Boolean));
        assert.ok(Type.isRefinement(boolAndString, Type.String));
        assert.ok(Type.isRefinement(Type.Boolean, boolAndString));
        assert.ok(Type.isRefinement(Type.String, boolAndString));

        assert.ok(Type.isRefinement(stringAndBool, Type.Boolean));
        assert.ok(Type.isRefinement(stringAndBool, Type.String));
        assert.ok(Type.isRefinement(Type.Boolean, stringAndBool));
        assert.ok(Type.isRefinement(Type.String, stringAndBool));

        assert.ok(Type.isRefinement(stringAndBool, boolAndString));
        assert.ok(Type.isRefinement(boolAndString, stringAndBool));

        assert.ok(!Type.isRefinement(stringAndBool, boolAndNum));
        assert.ok(!Type.isRefinement(stringAndBool, numAndBool));
        assert.ok(!Type.isRefinement(boolAndString, boolAndNum));
        assert.ok(!Type.isRefinement(boolAndString, numAndBool));

        var boolStrNum = Type.Union (Type.Boolean, Type.String, Type.Number);

        assert.ok(Type.isRefinement(boolStrNum, Type.Boolean));
        assert.ok(Type.isRefinement(boolStrNum, Type.String));
        assert.ok(Type.isRefinement(boolStrNum, Type.Number));

        assert.ok(Type.isRefinement(boolStrNum, boolAndString));
        assert.ok(Type.isRefinement(boolStrNum, stringAndBool));
        assert.ok(Type.isRefinement(boolStrNum, boolAndNum));
        assert.ok(Type.isRefinement(boolStrNum, numAndBool));

        assert.ok(!Type.isRefinement(boolAndString, boolStrNum));
        assert.ok(!Type.isRefinement(stringAndBool, boolStrNum));
        assert.ok(!Type.isRefinement(boolAndNum, boolStrNum));
        assert.ok(!Type.isRefinement(numAndBool, boolStrNum));

        var unaryUnion = Type.Union (Type.Number);
        assert.ok(Type.isRefinement(unaryUnion, Type.Number));
        assert.ok(Type.isRefinement(Type.Number, unaryUnion));
      });

      QUnit.test('record union types', function (assert) {
        var r1 = Type.Record ([ { id: 'foo', type: Type.Number } ]);
        var r2 = Type.Record ([ { id: 'bar', type: Type.Boolean }
                              , { id: 'baz', type: Type.String } ]);
        var r3 = Type.Record ([ { id: 'qux'
                                , type: Type.Record ([ { id: 'norf'
                                                       , type: Type.Number} ]) } ]);

        var r1r2 = Type.Union (r1, r2);
        var r1Num = Type.Union (r1, Type.Number);

        assert.ok(Type.isRefinement(r1r2, r1));
        assert.ok(Type.isRefinement(r1r2, r2));
        assert.ok(Type.isRefinement(r1, r1r2));
        assert.ok(Type.isRefinement(r2, r1r2));
        assert.ok(!Type.isRefinement(r1r2, Type.Number));
        assert.ok(!Type.isRefinement(r1r2, Type.Boolean));
        assert.ok(!Type.isRefinement(r1r2, Type.String));
        assert.ok(!Type.isRefinement(r1r2, Type.Record ([ { id: 'bzzzzzzt!'
                                                         , type: Type.String } ])));

        // this one's interesting
        assert.ok(Type.isRefinement(r1r2, Type.Record ([ { id: 'bar'
                                                         , type: Type.Boolean } ])));

        assert.ok(Type.isRefinement(r1Num, Type.Number));
        assert.ok(Type.isRefinement(r1Num, r1));
        assert.ok(!Type.isRefinement(r1Num, r2));
        assert.ok(!Type.isRefinement(r1r2, r1Num));

        var r1r3 = Type.Union (r1, r3);
        var r1r2r3 = Type.Union (r1, r2, r3);

        assert.ok(Type.isRefinement(r1r3, r3));
        assert.ok(Type.isRefinement(r3, r1r3));

        assert.ok(Type.isRefinement(r1r2r3, r1));
        assert.ok(Type.isRefinement(r1r2r3, r2));
        assert.ok(Type.isRefinement(r1r2r3, r3));

        assert.ok(Type.isRefinement(r1r2r3, r1r3));
        assert.ok(Type.isRefinement(r1r2r3, r1r2));

        // // union whose components are refined types of another union's components
        // var uni = Type.Union(Type.Record ([ { id: 'bar' }
        //                                   , { type: Type.Boolean }]),
        //                      r1);
        // console.log('---------');
        // assert.ok(Type.isRefinement(Type.Union(r1, r2), 
        //                             uni));
      });

      QUnit.test('advanced record union types', function (assert) {
        var r1 = Type.Record ([ { id: 'foo', type: Type.Number } ]);
        var r2 = Type.Record ([ { id: 'bar', type: Type.Boolean }
                              , { id: 'baz', type: Type.String } ]);

        // union whose components are refined types of another union's components
        var uni = Type.Union(Type.Record ([ { id: 'bar', type: Type.Boolean }]),
                             r1);
        assert.ok(Type.isRefinement(Type.Union(r1, r2), 
                                    uni));
      });

      QUnit.test('nested union types', function (assert) {
        var r1 = Type.Record ([ { id: 'foo', type: Type.Number } ]);
        var r2 = Type.Record ([ { id: 'bar', type: Type.Boolean }
                              , { id: 'baz', type: Type.String } ]);

        var r1r2 = Type.Union (r1, r2);
        var r1Num = Type.Union (r1, Type.Number);

        // r1, r2, Number
        var u1 = Type.Union(r1r2, Type.Number);

        // r1, r2, Number
        var u2 = Type.Union(r1r2, r1Num);

        assert.ok(Type.isRefinement(u1, r1r2));
        assert.ok(Type.isRefinement(u1, r1Num));
        assert.ok(Type.isRefinement(u1, Type.Number));
        assert.ok(Type.isRefinement(u1, r1));
        assert.ok(Type.isRefinement(u1, r2));

        assert.ok(Type.isRefinement(u2, r1r2));
        assert.ok(Type.isRefinement(u2, r1Num));
        assert.ok(Type.isRefinement(u2, Type.Number));
        assert.ok(Type.isRefinement(u2, r1));
        assert.ok(Type.isRefinement(u2, r2));

        assert.ok(!Type.isRefinement(u1, Type.Boolean));
        assert.ok(!Type.isRefinement(u1, Type.String));
        assert.ok(!Type.isRefinement(u2, Type.Boolean));
        assert.ok(!Type.isRefinement(u2, Type.String));

        assert.ok(Type.isRefinement(u1, u2));
        assert.ok(Type.isRefinement(u2, u1));
      });

      QUnit.test('simple solves', function (assert) {
        var foo = Type.Record ([ { id: 'foo', type: Type.Number } ]);
        var foobar = Type.Record ([ { id: 'foo', type: Type.Number }
                                  , { id: 'bar', type: Type.Boolean } ]);
        var barbaz = Type.Record ([ { id: 'bar', type: Type.Boolean }
                                  , { id: 'baz', type: Type.String } ]);
        var qux = Type.Record ([ { id: 'qux'
                                 , type: Type.Record ([ { id: 'norf', type: Type.Number} ]) } ]);
        var qux2 = Type.Record ([ { id: 'qux'
                                  , type: Type.Record ([ { id: 'norf', type: Type.Number}
                                                       , { id: 'narf', type: Type.Number} ]) } ]);

        var solution1 = Type.solve([ Type.refined(foo, foo)
                                   , Type.refined(qux, qux) ]);
        assert.ok(solution1.checks);

        var solution2 = Type.solve([ Type.refined(foobar, foo)
                                   , Type.refined(barbaz, barbaz) ]);
        assert.ok(solution2.checks);

        var solution3 = Type.solve([ Type.refined(qux2, qux)
                                   , Type.refined(foo, foo) ]);
        assert.ok(solution3.checks);

        assert.deepEqual(solution3.get(Type.Number), Type.Number);
        assert.deepEqual(solution3.get(foo), foo);

        var solution4 = Type.solve([ Type.refined(qux2, qux)
                                   , Type.refined(foo, foo)
                                   , Type.refined(foo, foobar) ]);
        assert.ok(!solution4.checks);

        var solution5 = Type.solve([ Type.refined(qux, qux2) ]);
        assert.ok(!solution5.checks);
      });

      QUnit.test('type variables', function (assert) {
        var t1   = Type.Variable ('a');
        var t1_2 = Type.Variable ('a');
        var t2   = Type.Variable ('b');

        var solution1 = Type.solve([ Type.refined(Type.Number, t1) ]);
        if (solution1.checks) {
          assert.deepEqual(solution1.get(Type.Variable('a')), Type.Number);
        } else {
          assert.ok(false);
        }

        var t3 = Type.Record ([ { id: 'foo', type: Type.Number } ]);
        var t4 = Type.Record ([ { id: 'foo', type: Type.Number }
                              , { id: 'bar', type: Type.Boolean }]);

        var solution2 = Type.solve([ Type.refined(t3, Type.Variable ('a'))
                                   , Type.refined(t4, Type.Variable ('a')) ]);
        if (solution2.checks) {
          assert.deepEqual(solution2.get(Type.Variable('a')), t3);
        } else {
          assert.ok(false);
        }

        var noSolution = Type.solve([ Type.refined(Type.Number, Type.Variable('a'))
                                    , Type.refined(t3, Type.Variable('a')) ]);
        assert.ok(noSolution.checks === false);

        var hmm = Type.solve([ Type.refined(Type.Number, Type.Variable('a')) ]);
        assert.ok(hmm.checks);
        assert.deepEqual(hmm.get(Type.Variable('b')), Type.Variable('b'));
      });

      QUnit.test('type variables inside record types', function (assert) {
        var t1 = Type.Record ([ { id: 'foo', type: Type.Variable ('a') } ]);
        var t2 = Type.Record ([ { id: 'foo', type: Type.Number } ]);

        var solution1 = Type.solve([ Type.refined(t2, t1) ]);
        if (solution1.checks) {
          assert.deepEqual(solution1.get(Type.Variable('a')), Type.Number);
        } else {
          assert.ok(false);
        }
      });

      QUnit.test('type variables with union types', function (assert) {
        var t1 = Type.Record ([ { id: 'foo', type: Type.Variable ('a') } ]);
        var t2 = Type.Record ([ { id: 'foo', type: Type.Record ([ { id: 'f1', type: Type.Number } ]) } ]);
        var t3 = Type.Record ([ { id: 'foo', type: Type.Record ([ { id: 'f1', type: Type.Number }
                                                                , { id: 'f2', type: Type.Boolean } ]) } ]);

        var foo = new Type.Record([ { id: 'foo', type: Type.Number } ]);
        var bar = new Type.Record([ { id: 'bar', type: Type.String } ]);

        var foobar = new Type.Record([ { id: 'foo', type: Type.Number }
                                     , { id: 'bar', type: Type.String } ]);

        var barbaz = Type.Record ([ { id: 'bar', type: Type.Boolean }
                                  , { id: 'baz', type: Type.String } ]);

        var foobarbaz = Type.Union (foo, barbaz);
        var foonum = Type.Union (foo, Type.Number);

        // union ::= foo | {bar,baz} | Number
        var union = Type.Union(foobarbaz, Type.Number);

        var solution1 = Type.solve([ Type.refined(union, t1) ]);
        if (solution1.checks) {
          assert.deepEqual(solution1.get(Type.Variable('a')), Type.Number);
        } else {
          assert.ok(false);
        }

        var solution2 = Type.solve([ Type.refined(Type.Union(t2, t3), t1) ]);
        if (solution2.checks) {
          assert.deepEqual(solution2.get(Type.Variable('a')), Type.Record ([ { id: 'f1', type: Type.Number } ]));
        } else {
          assert.ok(false);
        }

        assert.ok(!Type.solve([ Type.refined(t2, Type.Union(barbaz, Type.Number)) ]).checks);
      });

      QUnit.test('diffcult union type solving', function (assert) {
        var t1 = Type.Record ([ { id: 'foo', type: Type.Variable ('a') } ]);
        var t2 = Type.Record ([ { id: 'foo', type: Type.Record ([ { id: 'f1', type: Type.Number } ]) } ]);
        var t3 = Type.Record ([ { id: 'foo', type: Type.Record ([ { id: 'f1', type: Type.Number }
                                                                , { id: 'f2', type: Type.Boolean } ]) } ]);
        var solution = Type.solve([ Type.refined(Type.Union(t2, t3), Type.Union(t1, t2)) ]);
        assert.ok(solution.checks);
        assert.deepEqual(solution.get(Type.Variable('a')), Type.Record ([ { id: 'f1', type: Type.Number } ]));
      });

      QUnit.test('underconstrained solving', function (assert) {
        var solution1 = Type.solve([]);
        assert.ok(solution1.checks);
        assert.deepEqual(solution1.get(Type.Variable('a')), Type.Variable('a'));
      });
    }
  };
});