require.config({
  baseUrl: 'js',
  packages: [
    {
      name: 'physicsjs',
      location: 'libs/physicsjs/dist/',
      main: 'physicsjs-full'
    },
    {
      name: 'bacon',
      location: 'libs/bacon/dist/',
      main: 'Bacon'
    },
    {
      name: 'fabric',
      location: 'libs/fabric/dist/',
      main: 'fabric.require'
    },
    {
      name: 'underscore',
      location: 'libs/underscore/',
      main: 'underscore-min'
    },
    {
      name: 'pixi',
      location: 'libs/pixi/bin/',
      main: 'pixi.dev'
    },
    {
      name: 'pubsub',
      location: 'libs/pubsub-js/src/',
      main: 'pubsub'
    }
  ],
  shim: {
    'bacon': {
      exports: 'Bacon'
    }
  }
});

PIXI = {};
require([ 'pixi' ], function (_PIXI) {
  PIXI = _PIXI;
});