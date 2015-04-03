require.config({
  baseUrl: 'js',
  packages: [
    {
      name: 'physicsjs',
      location: 'libs/physicsjs/dist/',
      main: 'physicsjs-full.min'
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
    }
  ],
  shim: {
    'bacon': {
      exports: 'Bacon'
    }
  }
});

require(['testrunner']);
