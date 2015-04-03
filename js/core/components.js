/*
Defines the interface for a component.

Components give their objects two kinds of powers:
# Signals
# Actions
*/

define(function () {
  function Component (ownerObj, componentType) {
    // What other `Component`s does an `Obj` need to use this `Component`?
    this.requirements = [];
    
    // Maps identifiers to this `Component`'s `Signal`s
    this.signals = {};

    // Maps identifiers to this `Component`'s `Actions`s
    this.actions = {};

    // Identifier for this component type.
    this.componentType = componentType;

    this.serialize = function () {
      return {
        type: componentType,
        options: {}
      };
    };

    if (ownerObj !== null) {
      ownerObj.addComponent(componentType + ' ' + Object.keys(ownerObj.components).length, 
                            this);
    }
  }

  return Component;
});