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
  obj = scene.addObject('Box object');
  scene.addObject('Circle object');

  var geom = new Geometry(obj);
  var maus = new Mouse(obj);
  var xform = new Transform(obj);
  var time = new Time(obj);

  var moveBoxBehavior = Behavior.Behavior('Move box');
  scene.addBehavior(moveBoxBehavior);

  var timeInputNode = ArrowNode.InputNode(time.signals.Time.current);
  var scaleAndWrap = ArrowNode.ArrowNode(StdArrows.numberExpression (function (v) {
    return (v / 100.0) % (6.282 * 100);
  }));
  var sinu = ArrowNode.ArrowNode(StdArrows.numberExpression (function (v) {
    // return Math.sin(v) * 300;
    return 0;
  }));

  var mergeNode = ArrowNode.ArrowNode(StdArrows.merge);
  var justVectors = ArrowNode.ArrowNode(StdArrows.matchType(Vector2.type, Vector2.Vector2 (Data.Number (0)) (Data.Number (0))));
  var justNumbers = ArrowNode.ArrowNode(StdArrows.matchType(Datatype.Number, Data.Number (0)));

  var getX = ArrowNode.ArrowNode(StdArrows.fieldAccess('x'));
  var getY = ArrowNode.ArrowNode(StdArrows.fieldAccess('y'));

  var buildVec = ArrowNode.ArrowNode(StdArrows.buildRecord(Vector2.type));
  var sum = ArrowNode.ArrowNode(StdArrows.numberExpression(function (v1, v2) { 
    return v1 + v2;
  }));

  var outputPosition = ArrowNode.OutputNode(xform.signals.Transform.position);

  var mouseInput = ArrowNode.InputNode(maus.signals.Mouse.position);
  // Signal.subscribe(xform.signals.Transform.position, function (pos) {
  //   console.log('moving to ', pos.val.x.val, pos.val.y.val);
  // })

  moveBoxBehavior.addNode(timeInputNode);
  moveBoxBehavior.addNode(scaleAndWrap);
  moveBoxBehavior.addNode(sinu);
  moveBoxBehavior.addNode(mergeNode);
  moveBoxBehavior.addNode(justVectors);
  moveBoxBehavior.addNode(justNumbers);
  moveBoxBehavior.addNode(getX);
  moveBoxBehavior.addNode(getY);
  moveBoxBehavior.addNode(buildVec);
  moveBoxBehavior.addNode(sum);
  moveBoxBehavior.addNode(outputPosition);
  moveBoxBehavior.addNode(mouseInput);

  moveBoxBehavior.connect(timeInputNode, { node: scaleAndWrap, inlet: 0 });
  moveBoxBehavior.connect(scaleAndWrap,  { node: sinu, inlet: 0 });

  moveBoxBehavior.connect(sinu, { node: mergeNode, inlet: 0 });
  moveBoxBehavior.connect(mouseInput, { node: mergeNode, inlet: 1 });

  moveBoxBehavior.connect(mergeNode, { node: justVectors, inlet: 0 });
  moveBoxBehavior.connect(mergeNode, { node: justNumbers, inlet: 0 });

  moveBoxBehavior.connect(justVectors, { node: getX, inlet: 0 });
  moveBoxBehavior.connect(justNumbers, { node: sum, inlet: 0 });

  moveBoxBehavior.connect(getX, { node: sum, inlet: 1 });

  moveBoxBehavior.connect(justVectors, { node: getY, inlet: 0 });

  moveBoxBehavior.connect(sum, { node: buildVec, inlet: 0 });
  moveBoxBehavior.connect(getY, { node: buildVec, inlet: 1 });

  moveBoxBehavior.connect(buildVec, { node: outputPosition, inlet: 0 }); 

  var countMouseBehavior = Behavior.Behavior('Count mouse presses');
  scene.addBehavior(countMouseBehavior);

  var foldSum = ArrowNode.ArrowNode(StdArrows.foldp(Data.Number(0), Datatype.Number, function (v, acc) {
    return Data.Number (v.val + acc.val);
  }));
  var boolToNum = ArrowNode.ArrowNode(Arrow.EventArrow('boolToNum', [ Datatype.Boolean ], Datatype.Number, function (v) {
    if (v.val) {
      return Data.Number (1);
    } else {
      return Data.Number (0);
    }
  }));
  var filterRepeats = ArrowNode.ArrowNode(StdArrows.filterRepeats);
  var mouseDownInput = ArrowNode.InputNode(maus.signals.Mouse.down);
  var mouseCountSig = Signal.Signal(Datatype.Number);
  var mouseCount = ArrowNode.OutputNode(mouseCountSig);

  countMouseBehavior.addNode(foldSum);
  countMouseBehavior.addNode(boolToNum);
  countMouseBehavior.addNode(filterRepeats);
  countMouseBehavior.addNode(mouseDownInput);
  countMouseBehavior.addNode(mouseCount);

  Signal.subscribe(mouseCountSig, function (v) {
    console.log('Mouse clicked ' + v.val + ' times');
  });

  countMouseBehavior.connect(mouseDownInput, { node: boolToNum, inlet: 0 });
  countMouseBehavior.connect(boolToNum, { node: foldSum, inlet: 0 });
  countMouseBehavior.connect(foldSum, { node: filterRepeats, inlet: 0 });
  countMouseBehavior.connect(filterRepeats, { node: mouseCount, inlet: 0 });

  var accessX = StdArrows.fieldAccess('x').plug(maus.signals.Mouse.position);
  var simpleBehavior = Behavior.Behavior('Simple', [ ArrowNode.InputNode(accessX.signal) ]);
  scene.addBehavior(simpleBehavior);

  // come back to this...
  // var srl = JSON.stringify(Scene.serialize(scene));
  // var srl2 = JSON.stringify(JSON.parse(srl));
  // console.log(Scene.parse(JSON.parse(srl)));

  return {
    scene: scene
  };
});