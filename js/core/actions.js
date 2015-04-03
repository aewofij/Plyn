/*
An `Action` represents an event that the user can trigger.
*/

define([ 'core/datatypes'
       , 'util/listutil' ], function (Type, List) {
  // Creates an `Action` with specified argument types and procedure.
  //   argTypes : [Type]
  //   proc     : Function
  // TODO: `proc`'s arguments are unboxed. Actions usually push values to Signals; 
  //   this requires a reboxing. Is this the best method?
  function Action (argTypes, proc) {
    this.argTypes = argTypes;
    this.proc = proc;
  }

  /* Triggers `action` with the provided arguments.
   *
   * action : { argTypes : [Type], proc : Function }
   * args   : [<Data, based on arg types of `proc`>]
   */
  function trigger (action, args) {
    // Check for parity mismatch.
    if (args.length < action.argTypes.length) {
      throw {
        errorMessage: 'Mismatched parity.',
        action: action,
        expected: action.argTypes.length,
        actual: args.length
      };
    }

    // Type-check args.
    var checked = List.map2(action.argTypes, args, function (expected, actualArg) {
      return Type.isRefinement(actualArg.type, expected);
    }).reduce(function (p, c) {
      return p && c;
    }, true);

    if (!checked) {
      throw {
        errorMessage: 'Mismatched types.',
        action: action,
        expected: action.argTypes,
        actual: args.map(function (elm) { return elm.type })
      };
    }

    // Unwrap argument data.
    var unwrapped = args.map(function (elm) {
      return elm.val;
    });

    // Perform procedure.
    action.proc.apply(action, unwrapped);
  }

  // ----- RequireJS exports ----- //

  return {
    Action: Action,
    trigger: trigger
  };
});