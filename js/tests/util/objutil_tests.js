define([ 'util/objutil' ], function (ObjUtil) {
  return {
    run: function () {
      QUnit.module('ObjUtil');

      QUnit.test('field', function (assert) {
        var obj = { foo: 3
                  , bar: 'string'
                  , meth: function (a, b) { return a + b } };

        assert.equal(ObjUtil.field('foo')(obj), obj.foo);
        assert.equal(ObjUtil.field('bar')(obj), obj.bar);
        assert.equal(ObjUtil.field('not')(obj), undefined);
        assert.equal(ObjUtil.field('meth')(obj)(1,2), 3);
      });

      QUnit.test('extends', function (assert) {
        assert.deepEqual(ObjUtil.extend({}, { foo: 4 }), { foo: 4 });
        assert.deepEqual(ObjUtil.extend({ bar: 3 }, { foo: 4 }), { foo: 4, bar: 3 });
        assert.deepEqual(ObjUtil.extend({ foo: 5 }, { foo: 4 }), { foo: 4 });

        var on = { 
          bar: {
            baz: true,
            qux: 3    
          }
        };

        var extendWith = { 
          foo: 4, 
          bar: {
            baz: false
          }
        };

        var res = {
          foo: 4,
          bar: {
            baz: false,
            qux: 3
          }
        };
        assert.deepEqual(ObjUtil.extend(on, extendWith), res);

        var o1 = {
          inner: {
            foo: 1
          }
        };
        var barAdd = {
          inner: {
            bar: { a: 1 }
          }
        };
        var outerAdd = {
          outer: 3
        };
        var o2 = {
          inner: {
            foo: 1,
            bar: { a: 1 }
          }
        };
        var o3 = {
          inner: {
            foo: 1,
            bar: { a: 1 }
          },
          outer: 3
        };

        assert.deepEqual(ObjUtil.extend(o1, barAdd), o2);
        assert.deepEqual(ObjUtil.extend(ObjUtil.extend(o1, barAdd), outerAdd), o3);

        var acc = {
          variables: {
            a: {
              type: 1
            }
          }
        };

        var newVar = {
          variables: {
            b: {
              type: 2
            }
          }
        };

        var checked = {
          checks: true
        };

        var together = {
          variables: {
            a: {
              type: 1
            },
            b: {
              type: 2
            }
          },
          checks: true
        };

        assert.deepEqual(ObjUtil.extend(ObjUtil.extend(acc, newVar), checked), together);
      });

      QUnit.test('more extends', function (assert) {
        var o1 = {
          foo: 'string',
          bar: {
            baz: 1
          }
        };
        var o2 = {
          foo: 'string',
          bar: {
            baz: 1,
            qux: false
          }
        };

        var adding = {
          bar: {
            qux: false
          }
        };

        assert.deepEqual(ObjUtil.extend(o1, adding), o2);
      });

      QUnit.test('objMap', function (assert) {
        var o1 = {
          foo: 1,
          bar: 2
        };
        var o2 = {
          foo: 2,
          bar: 4
        };
        var times2 = function (k,v) {
          return v * 2;
        }

        assert.deepEqual(ObjUtil.objMap(o1, times2), o2);

        var o3 = {
          foo: 1,
          bar: {
            qux: "string",
            baz: [ true, true, true ]
          }
        };

        var o4 = {
          foo: 0,
          bar: {
            qux: 'stringcheese',
            baz: 'a new type'
          }
        };

        var xform = function (k,v) {
          if (k === 'foo') {
            return 0;
          } else if (k === 'bar') {
            return ObjUtil.objMap(v, function (k2,v2) {
              if (k2 === 'qux') {
                return v2 + 'cheese';
              } else {
                return 'a new type';
              }
            });
          }
        };

        assert.deepEqual(ObjUtil.objMap(o3, xform), o4);
      })
    }
  }
})