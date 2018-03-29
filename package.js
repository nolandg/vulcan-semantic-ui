Package.describe({
  name: "noland:vulcan-semantic-ui",
  summary: "Brings Semantic UI React to Vulcan",
  version: '1.0.1',
});

Package.onUse(function (api) {

  api.versionsFrom('METEOR@1.6.1');

  api.use([

    'promise',
    'fourseven:scss@4.5.0',

    // vulcan core
    'vulcan:core@1.8.7',
  ]);

  api.addAssets([
    'lib/assets/images/powered_by_google_default.png',
  ], ['client']);

  api.addAssets([
  ], ['server']);

  api.addFiles([
    'lib/stylesheets/main.scss',
  ], ['client']);

  api.mainModule("lib/server/main.js", "server");
  api.mainModule("lib/client/main.js", "client");

});
