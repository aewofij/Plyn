define([ 'core/signals'
       , 'core/datatypes'
       , 'core/data'
       , 'core/actions'
       , 'core/arrow'
       , 'arrows/std-arrows'
       , 'core/behavior/arrow-node'
       , 'core/behavior/behavior'
       , 'core/behavior/node-registry'
       , 'modules/transform'
       , 'util/vector3'
       , 'util/objutil'
       ], function ( Signal, Type, Data, Action, Arrow, StdArrows,
                      ArrowNode, Behavior, NodeRegistry, Transform, Vector3, ObjUtil ) {
    return {
      run: function () {
        QUnit.module('Arrow nodes');

        QUnit.test('basic operations', function (assert) {
          var s1 = Signal.Signal(Type.Number, Data.Number(0));
          var s2 = Signal.Signal(Type.Number, Data.Number(0));
          var s3 = Signal.Signal(Type.String);
          var outSig = Signal.Signal(Type.Number, Data.Number(-1));

          var inputNode1 = ArrowNode.InputNode(s1);
          var inputNode2 = ArrowNode.InputNode(s2);
          var strInput = ArrowNode.InputNode(s3);

          var outputNode = ArrowNode.OutputNode(outSig);

          var sumNode = ArrowNode.ArrowNode(StdArrows.numberExpression()
                                                     .setParameter('expression', function (v1, v2) {
            return v1 + v2;
          }));

          var beh = Behavior.Behavior('myBehavior');
          beh.addNode(inputNode1);
          beh.addNode(inputNode2);
          beh.addNode(strInput);
          beh.addNode(outputNode);
          beh.addNode(sumNode);

          assert.deepEqual(Signal.pull(outSig), Data.Number(-1));

          beh.connect(inputNode1, { node: sumNode, inlet: 0 });
          assert.deepEqual(Signal.pull(outSig), Data.Number(-1));

          beh.connect(strInput, { node: sumNode, inlet: 1 });
          assert.deepEqual(Signal.pull(outSig), Data.Number(-1));
          assert.notEqual(sumNode.inlets[0], null);
          assert.equal(sumNode.inlets[1], null);

          beh.connect(inputNode2, { node: sumNode, inlet: 1 });
          assert.deepEqual(Signal.pull(outSig), Data.Number(-1));

          beh.connect(sumNode, { node: outputNode, inlet: 0 });
          assert.deepEqual(Signal.pull(outSig), Data.Number(0));

          Signal.push(s1, Data.Number(1));
          assert.deepEqual(Signal.pull(outSig), Data.Number(1));

          Signal.push(s2, Data.Number(2));
          assert.deepEqual(Signal.pull(outSig), Data.Number(3));

          var in3 = Signal.Signal(Type.Boolean, Data.Boolean(false));
          var in4 = Signal.Signal(Type.String, Data.String("asdfas"));
          var inputNode3 = ArrowNode.InputNode(in3);
          var inputNode4 = ArrowNode.InputNode();
          inputNode4.arrow.setParameter('signal', in4);

          beh.addNode(inputNode3);
          beh.addNode(inputNode4);

          beh.disconnect(inputNode1, { node: sumNode, inlet: 0 });
          // node holds output signal on disconnect
          assert.deepEqual(Signal.pull(outSig), Data.Number(3));

          Signal.push(s1, Data.Number(10));
          assert.deepEqual(Signal.pull(outSig), Data.Number(3));

          Signal.push(s2, Data.Number(10));
          assert.deepEqual(Signal.pull(outSig), Data.Number(3));

          beh.connect(inputNode3, { node: sumNode, inlet: 0 });
          beh.connect(inputNode4, { node: sumNode, inlet: 0 });
          Signal.push(in3, Data.Boolean(true));
          Signal.push(in4, Data.String('AHHH'));
          assert.deepEqual(Signal.pull(outSig), Data.Number(3));
      });

      QUnit.test('re-plugging into polymorphic arrows', function (assert) {
        var inSig1 = Signal.Signal(Type.String, Data.String('a string'));
        var outSig1 = Signal.Signal(Type.String);
        var inputNode1 = ArrowNode.InputNode(inSig1)
        var filterNode = ArrowNode.ArrowNode(StdArrows.filterRepeats);
        var outputNode1 = ArrowNode.OutputNode();
        outputNode1.arrow.setParameter('signal', outSig1);

        var beh = Behavior.Behavior('otherBeh');
        beh.addNode(inputNode1)
           .addNode(filterNode)
           .addNode(outputNode1);

        beh.connect(inputNode1, { node: filterNode,  inlet: 0 });
        // inputNode1 : String 
        //   |> filterNode : (String -> String) 

        beh.connect(filterNode, { node: outputNode1, inlet: 0 });
        // inputNode1 : String
        //   |> filterNode : String -> String
        //   |> outputNode1 : String -> void

        assert.equal(Object.keys(inputNode1.outlet).length, 1);
        assert.equal(Object.keys(filterNode.outlet).length, 1);

        assert.deepEqual(Signal.pull(outSig1), Data.String('a string'));

        Signal.push(inSig1, Data.String ('another string'))
        assert.deepEqual(Signal.pull(outSig1), Data.String('another string'));

        beh.disconnect(inputNode1, { node: filterNode, inlet: 0 });
        // () : String
        //   |> filterNode : String -> String
        //   |> outputNode1 : String -> void
        assert.deepEqual(Signal.pull(outSig1), Data.String('another string'));

        assert.equal(Object.keys(inputNode1.outlet).length, 0);
        assert.equal(Object.keys(filterNode.outlet).length, 1);

        var inSig2 = Signal.Signal(Type.Number, Data.Number(5));
        var outSig2 = Signal.Signal(Type.Number);
        var inputNode2 = ArrowNode.InputNode(inSig2);
        var outputNode2 = ArrowNode.OutputNode(outSig2);

        beh.addNodes(inputNode2, outputNode2);

        // for inspection
        inputNode2['name'] = 'InputNode2';
        filterNode['name'] = 'FilterNode';
        outputNode1['name'] = 'OutputNode1';

        beh.connect(inputNode2, { node: filterNode, inlet: 0 });
        // inputNode2 : Number
        //   |> filterNode : Number -> Number
        //   |> outputNode1 : Number -> void

        // previous output was automatically disconnected, since its type
        //   no longer matched `filterNode`'s output
        assert.ok(Object.keys(filterNode.outlet).length === 0);

        beh.connect(filterNode, { node: outputNode2, inlet: 0 });
        assert.deepEqual(Signal.pull(outSig2), Data.Number(5));

        Signal.push(inSig2, Data.Number(2));
        assert.deepEqual(Signal.pull(outSig2), Data.Number(2));
      });

      QUnit.test('changing arrows', function (assert) {
        var inSig1 = Signal.Signal(Type.Number, Data.Number(0));
        var inSig2 = Signal.Signal(Type.Number, Data.Number(1));
        var outSig1 = Signal.Signal(Type.Number);
        var inputNode1 = ArrowNode.InputNode(inSig1);
        var inputNode2 = ArrowNode.InputNode(inSig2);
        var sumArrow = StdArrows.numberExpression().setParameter('expression', function (v1,v2) {
          return v1 + v2;
        });
        var exprNode = ArrowNode.ArrowNode(sumArrow);
        var numIden = ArrowNode.ArrowNode(StdArrows.numberExpression()
                                                   .setParameter('expression', function (v) {
          return v;
        }));
        var outputNode1 = ArrowNode.OutputNode(outSig1);

        var beh = Behavior.Behavior('otherBeh');
        beh.addNodes(inputNode1, inputNode2, exprNode, numIden, outputNode1);

        beh.connect(inputNode1, { node: exprNode, inlet: 0 });
        beh.connect(inputNode2, { node: exprNode, inlet: 1 });
        beh.connect(exprNode, { node: numIden, inlet: 0 });
        assert.equal(Object.keys(exprNode.outlet).length, 1);
        beh.connect(numIden, { node: outputNode1, inlet: 0 });

        Signal.push(inSig1, Data.Number(4));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(5));

        Signal.push(inSig2, Data.Number(6));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(10));

        // type variables, but should still check
        var exprNode_ = beh.swapNode(exprNode, ArrowNode.ArrowNode(StdArrows.merge));
        assert.equal(Object.keys(exprNode_.outlet).length, 1);

        Signal.push(inSig1, Data.Number(1));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(1));

        Signal.push(inSig2, Data.Number(3));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(3));

        // does not check with inputs
        var exprNode2 = 
          beh.swapNode(exprNode_, 
                       ArrowNode.ArrowNode(Arrow.EventArrow('String x Number -> Number',
                                                            [],
                                                            [ Type.String, Type.Number ],
                                                            Type.Number,
                                                            function (str, num) { return num })));

        // sort of implementation-based, sry
        assert.equal(exprNode2.inlets[0], null);
        assert.equal(exprNode2.inlets[1], null);
        assert.equal(Object.keys(exprNode2.outlet).length, 1)
        assert.deepEqual(exprNode2.outlet[Object.keys(exprNode2.outlet)[0]], 
                         { node: numIden, inlet: 0 });

        Signal.push(inSig1, Data.Number(100));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(3));
        Signal.push(inSig2, Data.Number(100));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(3));

        // back to original arrow
        var exprNode3 = beh.swapNode(exprNode2, ArrowNode.ArrowNode(sumArrow));
        beh.connect(inputNode1, { node: exprNode3, inlet: 0 });
        beh.connect(inputNode2, { node: exprNode3, inlet: 1 });

        Signal.push(inSig1, Data.Number(1));
        Signal.push(inSig2, Data.Number(3));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(4));

        // does not check with output
        var exprNode4 = 
          beh.swapNode(exprNode3,
                       ArrowNode.ArrowNode(Arrow.EventArrow('Number x Number -> String',
                                                            [],
                                                            [ Type.Number, Type.Number ],
                                                            Type.String,
                                                            function (n1, n2) { 
                                                              return Data.String ('yoopi!') 
                                                            })));

        // sort of implementation-based, sry
        assert.equal(exprNode4.inlets[0], inputNode1);
        assert.equal(exprNode4.inlets[1], inputNode2); 
        assert.equal(Object.keys(exprNode4.outlet).length, 0);

        Signal.push(inSig1, Data.Number(4));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(4));
        Signal.push(inSig2, Data.Number(10));
        assert.deepEqual(Signal.pull(outSig1), Data.Number(4));
      });

      QUnit.test('swapping for a node with union output', function (assert) {
        // node `a` with no inputs, concrete output plugged into concrete other node `b`
        var a = ArrowNode.InputNode(Signal.Signal(Type.Number));
        var sum = NodeRegistry.getNode('sum').instance.node;

        var beh = Behavior.Behavior('beh', [a, sum]);

        beh.connect(a, { node: sum, inlet: 0 });
        assert.equal(Object.keys(a.outlet).length, 1);
        assert.deepEqual(a.outlet[Object.keys(a.outlet)[0]],
                         { node: sum, inlet: 0 });

        // swap `merge` node for `a`
        var a2 = beh.swapNode(a, NodeRegistry.getNode('merge').instance.node);

        // `merge` should now be connected to `b`
        assert.equal(Object.keys(a2.outlet).length, 1);
        assert.deepEqual(a2.outlet[Object.keys(a2.outlet)[0]],
                         { node: sum, inlet: 0 });
      });

      QUnit.test('setting arrow parameters', function (assert) {
        var exprArrow = StdArrows.numberExpression();
        var expr = ArrowNode.ArrowNode(exprArrow);

        assert.equal(exprArrow.inputTypes.length, 0);
        assert.equal(expr.inlets.length, exprArrow.inputTypes.length);

        var inSig1 = Signal.Signal(Type.Number, Data.Number(-1));
        var inSig2 = Signal.Signal(Type.Number, Data.Number(-1));
        var outSig = Signal.Signal(Type.Number, Data.Number(-1));

        var inNode1 = ArrowNode.InputNode(inSig1);
        var inNode2 = ArrowNode.InputNode(inSig2);
        var outNode = ArrowNode.OutputNode(outSig);

        var beh = Behavior.Behavior('beh', [inNode1, inNode2, outNode]);
        beh.connect(expr, { node: outNode, inlet: 0 });

        // apparently stateful? should check tho
        // assert.throws(function () { beh.connect(inNode1, { node: expr, inlet: 0 }) });

        assert.equal(exprArrow.inputTypes.length, 0);
        assert.equal(expr.inlets.length, exprArrow.inputTypes.length);

        var done = assert.async();
        var asyncCheck1 = function () {
          assert.equal(exprArrow.inputTypes.length, 1);
          assert.equal(expr.inlets.length, exprArrow.inputTypes.length);
          done();
        };
        Object.observe(exprArrow.inputTypes, asyncCheck1);
        exprArrow.setParameter('expression', function (v) {
          return v * 2;
        });
        Object.unobserve(exprArrow.inputTypes, asyncCheck1);

        beh.connect(inNode1, { node: expr, inlet: 0 })

        Signal.push(inSig1, Data.Number(1));
        assert.deepEqual(Signal.pull(outNode.signal), Data.Number(2));

        /* I DON'T GET HOW I'M SUPPOSED TO TEST THIS
           I THINK IT WORKS THOUGH? 
           GD
        */

        // var done2 = assert.async();
        // var asyncCheck2 = function () {
        //   assert.equal(expr.inlets.length, 2);

        //   assert.equal(expr.inlets[0].id, inNode1.id);
        //   assert.deepEqual(expr.inlets[0], inNode1);

        //   assert.equal(outNode.inlets[0].id, expr.id);
        //   assert.deepEqual(outNode.inlets[0], expr);
        //   assert.deepEqual(Signal.pull(outNode.signal), Data.Number(2));

        //   beh.connect(inNode2, { node: expr, inlet: 1 });

        //   Signal.push(inSig2, Data.Number(5));
        //   assert.deepEqual(Signal.pull(outNode.signal), Data.Number(6));
        //   done2();
        // };
        // Object.observe(exprArrow.inputTypes, asyncCheck2);
        // exprArrow.setParameter('expression', function (v1, v2) {
        //   return v1 + v2;
        // });
        // Object.observe(exprArrow.inputTypes, asyncCheck2);


        // console.log('b4set');
        // exprArrow.setParameter('expression', function (v) {
        //   return v + 1;
        // });
        // console.log('afterset');

        // assert.equal(expr.inlets.length, 1);

        // assert.deepEqual(expr.inlets[0].id, inNode1.id);
        // assert.deepEqual(expr.inlets[0], inNode1);
        // assert.equal(expr.inlets[1], undefined);
        // assert.notDeepEqual(expr.inlets[1], inNode2);

        // var pulled = Signal.pull(outSig1);
        // Signal.push(inNode2, Data.Number(2));
        // assert.deepEqual(Signal.pull(outNode.signal), pulled);

        // assert.deepEqual(Signal.pull(outNode.signal), Data.Number(6));

        // Signal.push(inSig2, Data.Number(10));
        // assert.deepEqual(Signal.pull(outNode.signal), Data.Number(11));
      });
    }
  }
});