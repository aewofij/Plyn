var rerunQUnitTest;

require([ 'tests/datatype_tests'
        , 'tests/data_tests'
        , 'tests/signal_tests' 
        , 'tests/action_tests' 
        , 'tests/arrow_tests'
        , 'tests/std-arrows_tests' 
        , 'tests/arrow-node_tests'
        , 'tests/util/objutil_tests'
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