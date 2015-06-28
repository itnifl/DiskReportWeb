var Config = require('./config');
var Routes = require('./routes');
var Hapi = require('hapi'); //http://hapijs.com/tutorials

var hapiServer = new Hapi.Server();
hapiServer.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './views',
    layoutPath: './views/layout',
    partialsPath: './views/partials',
    layout: true
});
hapiServer.connection({ port: Config.Port });
Routes.addRoutes(hapiServer);

hapiServer.start(function () {
    console.log('Server running at:', hapiServer.info.uri);
});