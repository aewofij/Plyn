define([ 'core/signals'
        , 'core/actions'
        , 'core/arrow'
        , 'core/datatypes'
        , 'core/data'
        , 'core/obj'
        , 'core/scene'
        , 'core/behavior/arrow-node'
        , 'core/behavior/behavior'
        , 'arrows/std-arrows'
        , 'modules/transform'
        , 'modules/geometry'
        , 'modules/time'
        , 'modules/mouse'
        , 'util/vector2'
        , 'util/objutil'
        , 'physicsjs'
        , 'physics/behaviors/transform'
        , 'physics/bodies/objbody'
        , 'physicsjs/bodies/rectangle'
        , 'physicsjs/geometries/rectangle'
        ], function ( Signal, Action, Arrow, Datatype, 
                      Data, Obj, Scene, ArrowNode, Behavior, 
                      StdArrows, Transform, Geometry, Time, Mouse,
                      Vector2, ObjUtil, Physics ) {
  var scene = new Scene.Scene();
  var obj = scene.addObject('Box object');
  var circle = scene.addObject('Circle object');

  var geom = new Geometry(obj);
  var maus = new Mouse(obj);
  var xform = new Transform(obj);
  var time = new Time(obj);

  // ------- START SUPER SIMPLE BEHAVIOR ------- //

  var superSimple = Behavior.Behavior('Super simple');
  scene.addBehavior(superSimple);

  var ssMouseInput = ArrowNode.InputNode(maus.signals.Mouse.position);
  var ssPositionOutput = ArrowNode.OutputNode(xform.signals.Transform.position);

  superSimple.connect(ssMouseInput, { node: ssPositionOutput, inlet: 0 });

  Signal.subscribe(maus.signals.Mouse.position, function (v) {
    console.log('mouse moved', v);
  })

  Signal.subscribe(xform.signals.Transform.position, function (v) {
    console.log('obj moved', v);
  })

  // ------- START MOVE BOX BEHAVIOR ------- //

  // var moveBoxBehavior = Behavior.Behavior('Move box');
  // scene.addBehavior(moveBoxBehavior);

  // var timeInputNode = ArrowNode.InputNode(time.signals.Time.current);
  // var scaleAndWrap = ArrowNode.ArrowNode(StdArrows.numberExpression()
  //                                                 .setParameter('expression', function (v) {
  //   return (v / 100.0) % (6.282 * 100);
  // }));
  // var sinu = ArrowNode.ArrowNode(StdArrows.numberExpression()
  //                                         .setParameter('expression', function (v) {
  //   var r = Math.sin(v) * 300;
  //   // console.log(r);
  //   return r;
  // }));

  // var mergeNode = ArrowNode.ArrowNode(StdArrows.merge);
  // var justVectors = ArrowNode.ArrowNode(StdArrows.matchType()
  //                                                .setParameter('type', Vector2.type)
  //                                                .setParameter('defaultValue', Vector2.Vector2 (Data.Number (0)) 
  //                                                                                              (Data.Number (0))));
  // var justNumbers = ArrowNode.ArrowNode(StdArrows.matchType()
  //                                                .setParameter('type', Datatype.Number)
  //                                                .setParameter('defaultValue', Data.Number (0)));

  // var getX = ArrowNode.ArrowNode(StdArrows.fieldAccess().setParameter('field id', 'x'));
  // var getY = ArrowNode.ArrowNode(StdArrows.fieldAccess().setParameter('field id', 'y'));

  // var buildVec = ArrowNode.ArrowNode(StdArrows.buildRecord().setParameter('record type', Vector2.type));
  // var sum = ArrowNode.ArrowNode(StdArrows.numberExpression().setParameter('expression', function (v1, v2) { 
  //   return v1 + v2;
  // }));

  // var outputPosition = ArrowNode.OutputNode(xform.signals.Transform.position);
  // var mouseInput = ArrowNode.InputNode(maus.signals.Mouse.position);

  // moveBoxBehavior.addNode(timeInputNode);
  // moveBoxBehavior.addNode(scaleAndWrap);
  // moveBoxBehavior.addNode(sinu);
  // moveBoxBehavior.addNode(mergeNode);
  // moveBoxBehavior.addNode(justVectors);
  // moveBoxBehavior.addNode(justNumbers);
  // moveBoxBehavior.addNode(getX);
  // moveBoxBehavior.addNode(getY);
  // moveBoxBehavior.addNode(buildVec);
  // moveBoxBehavior.addNode(sum);
  // moveBoxBehavior.addNode(outputPosition);
  // moveBoxBehavior.addNode(mouseInput);

  // moveBoxBehavior.connect(timeInputNode, { node: scaleAndWrap, inlet: 0 });
  // moveBoxBehavior.connect(scaleAndWrap,  { node: sinu, inlet: 0 });

  // moveBoxBehavior.connect(sinu, { node: mergeNode, inlet: 0 });
  // moveBoxBehavior.connect(mouseInput, { node: mergeNode, inlet: 1 });

  // moveBoxBehavior.connect(mergeNode, { node: justVectors, inlet: 0 });
  // moveBoxBehavior.connect(mergeNode, { node: justNumbers, inlet: 0 });

  // moveBoxBehavior.connect(justVectors, { node: getX, inlet: 0 });
  // moveBoxBehavior.connect(justNumbers, { node: sum, inlet: 0 });

  // moveBoxBehavior.connect(getX, { node: sum, inlet: 1 });

  // moveBoxBehavior.connect(justVectors, { node: getY, inlet: 0 });

  // moveBoxBehavior.connect(sum, { node: buildVec, inlet: 0 });
  // moveBoxBehavior.connect(getY, { node: buildVec, inlet: 1 });

  // moveBoxBehavior.connect(buildVec, { node: outputPosition, inlet: 0 }); 

  // Signal.subscribe(mouseInput.signal, function (v) {
  //   console.log('this one', 
  //               xform.signals.Transform.position.current.val.x.val, 
  //               xform.signals.Transform.position.current.val.y.val);
  //   Signal.push(xform.signals.Transform.position, v);
  // });

  // ------- END MOVE BOX BEHAVIOR ------- //



  // var countMouseBehavior = Behavior.Behavior('Count mouse presses');
  // scene.addBehavior(countMouseBehavior);

  // var foldSum = ArrowNode.ArrowNode(StdArrows.foldp()
  //                                            .setParameter('initialState', Data.Number(0)) 
  //                                            .setParameter('returnType', Datatype.Number) 
  //                                            .setParameter('transitionFunction', function (v, acc) {
  //                                                                return Data.Number (v.val + acc.val);
  //                                                              }));
  // var boolToNum = ArrowNode.ArrowNode(Arrow.EventArrow('boolToNum', [], [ Datatype.Boolean ], Datatype.Number, function (v) {
  //   if (v.val) {
  //     return Data.Number (1);
  //   } else {
  //     return Data.Number (0);
  //   }
  // }));
  // var filterRepeats = ArrowNode.ArrowNode(StdArrows.filterRepeats);
  // var mouseDownInput = ArrowNode.InputNode(maus.signals.Mouse.down);
  // var mouseCountSig = Signal.Signal(Datatype.Number);
  // var mouseCount = ArrowNode.OutputNode(mouseCountSig);

  // countMouseBehavior.addNode(foldSum);
  // countMouseBehavior.addNode(boolToNum);
  // countMouseBehavior.addNode(filterRepeats);
  // countMouseBehavior.addNode(mouseDownInput);
  // countMouseBehavior.addNode(mouseCount);

  // Signal.subscribe(mouseCountSig, function (v) {
  //   console.log('Mouse clicked ' + v.val + ' times');
  // });

  // countMouseBehavior.connect(mouseDownInput, { node: boolToNum, inlet: 0 });
  // countMouseBehavior.connect(boolToNum, { node: foldSum, inlet: 0 });
  // countMouseBehavior.connect(foldSum, { node: filterRepeats, inlet: 0 });
  // countMouseBehavior.connect(filterRepeats, { node: mouseCount, inlet: 0 });

  // var accessX = StdArrows.fieldAccess().setParameter('field id', 'x').plug(maus.signals.Mouse.position);
  // var simpleBehavior = Behavior.Behavior('Simple', [ ArrowNode.InputNode(accessX.signal) ]);
  // scene.addBehavior(simpleBehavior);




  // ------- START RECURSIVE BEHAVIOR ------- //

  // var recursive = Behavior.Behavior('Recursive nudge');
  // scene.addBehavior(recursive);

  // var mouseInput2 = ArrowNode.InputNode(maus.signals.Mouse.position);
  // var positionInput = ArrowNode.InputNode(xform.signals.Transform.position);
  // var positionOutput2 = ArrowNode.OutputNode(xform.signals.Transform.position);

  // var vecDiffArrow = StdArrows.vectorExpression().setParameter('expression', function (vec1, vec2) {
  //   return {
  //     x: vec2.x - vec1.x,
  //     y: vec2.y - vec1.y
  //   };
  // });
  // var vecDiff = ArrowNode.ArrowNode(vecDiffArrow);

  // var vecScaleArrow = StdArrows.vectorExpression().setParameter('expression', function (vec) {
  //   return {
  //     x: vec.x * 0.6,
  //     y: vec.y * 0.6
  //   };
  // });
  // var vecScale = ArrowNode.ArrowNode(vecScaleArrow);

  // var vecAddArrow = StdArrows.vectorExpression().setParameter('expression', function (vec1, vec2) {
  //   var result = {
  //     x: vec2.x + vec1.x,
  //     y: vec2.y + vec1.y
  //   };
  //   return result;
  // });
  // var vecAdd = ArrowNode.ArrowNode(vecAddArrow);

  // recursive.addNode(mouseInput2)
  //          .addNode(positionInput)
  //          .addNode(positionOutput2)
  //          .addNode(vecDiff)
  //          .addNode(vecScale)
  //          .addNode(vecAdd);

  // recursive.connect(positionInput, {node: vecDiff, inlet: 0});
  // recursive.connect(mouseInput2, {node: vecDiff, inlet: 1});
  // recursive.connect(vecDiff, {node: vecScale, inlet: 0});
  // recursive.connect(vecScale, {node: vecAdd, inlet: 0});
  // recursive.connect(mouseInput2, {node: vecAdd, inlet: 1});
  // recursive.connect(vecAdd, {node: positionOutput2, inlet: 0});
  
  // ------- END RECURSIVE BEHAVIOR ------- //

  // ------- START SIMPLE RECURSIVE BEHAVIOR ------- //

  // var circleXform = new Transform(circle);
  // var circleGeom = new Geometry.Circle(circle);
  // var circleXform = new Transform(circle);

  // // var sr = Behavior.Behavior('Simple recursive');
  // // scene.addBehavior(sr);

  // var positionInputSR = ArrowNode.InputNode(xform.signals.Transform.position);
  // var positionOutputSR = ArrowNode.OutputNode(xform.signals.Transform.position);

  // var nudgeNode = ArrowNode.ArrowNode(StdArrows.vectorExpression()
  //                                              .setParameter('expression', function (vec) {
  //                                               console.log('received', vec);
  //                                                return {
  //                                                  x: vec.x + 1,
  //                                                  y: vec.y,
  //                                                }
  //                                              }));

  // moveBoxBehavior.connect(positionInputSR, { node: nudgeNode, inlet: 0 });
  // moveBoxBehavior.connect(nudgeNode, { node: positionOutputSR, inlet: 0 });

  // ------- END SIMPLE RECURSIVE BEHAVIOR ------- //

  // come back to this...
  // var srl = JSON.stringify(Scene.serialize(scene));
  // var srl2 = JSON.stringify(JSON.parse(srl));
  // console.log(Scene.parse(JSON.parse(srl)));

  return {
    scene: scene
  };
});