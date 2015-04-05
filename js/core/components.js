/*
Defines the interface for a component.
*/

define(function () {
  function Component (ownerObj) {
    // What other `Component`s does an `Obj` need to use this `Component`?
    this.requirements = [];
    
    // Maps identifiers to this `Component`'s `Signal`s
    this.signals = {};

    // Maps identifiers to this `Component`'s `Actions`s
    this.actions = {};

    // // Identifier for this component type.
    // this.componentType = componentType;

    this.serialize = (function () {
      return {
        type: this.componentType,
        options: {}
      };
    }).bind(this);

    if (ownerObj !== null) {
      ownerObj.addComponent(this.componentType + ' ' + Object.keys(ownerObj.components).length, 
                            this);
    }
  }

  return Component;
});