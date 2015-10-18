requirejs([
    './main',
  ], function(
     main
  ) {
  main.start();
});
requirejs.config({
  paths: {
    '3rdparty': '../3rdparty',
  },
});

