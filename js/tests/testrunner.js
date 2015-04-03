var rerunQUnitTest;

require([ 'datatype_tests'
        , 'data_tests'
        , 'signal_tests' 
        , 'action_tests' 
        , 'arrow_tests'
        , 'std-arrows_tests' 
        , 'arrow-node_tests'
        , 'util/objutil_tests'
        ], 
        function (Datatypes, Data, 
                  Signals, Actions, Arrows, StdArrows,
                  ArrowNodes, ObjUtil) {
  // call rerunQUnitTest to reset and run your tests again.
  rerunQUnitTest = function () {
      QUnit.reset();  // should clear the DOM
      QUnit.init();   // resets the qunit test environment
      QUnit.start();  // allows for the new test to be captured.
      runAllTests();   // runs your functions that has all the test wrapped inside.
  };

  var runAllTests = function () {
    Datatypes.run();
    Data.run();
    Signals.run();
    Actions.run();
    Arrows.run();
    StdArrows.run();
    ArrowNodes.run();
    ObjUtil.run();
  };

  runAllTests();
});