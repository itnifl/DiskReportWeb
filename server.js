var Config = require('./config');
var Routes = require('./routes');
var Hapi = require('hapi'); //http://hapijs.com/tutorials
var async = require("async");
var io;

var hapiServer = new Hapi.Server();
hapiServer.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './views',
    layoutPath: './views/layout',
    partialsPath: './views/partials',
    helpersPath: './views/helpers',
    layout: true
});
hapiServer.connection({ port: Config.Port, labels: 'http' });
hapiServer.connection({ port: Config.SocketIOPort, labels: 'io' });

async.waterfall([
   function(waterfall_callback) {
      io = require('socket.io').listen(hapiServer.select('io').listener, function() {
         console.log('socket.io listening on *:' + hapiServer.select('io').listener);
      });  
      waterfall_callback(null);
   },
   function(waterfall_callback) {
      Routes.addRoutes(hapiServer.select('http'));

      hapiServer.start(function () {
         console.log('Server running at:', hapiServer.info.uri);
      });
      io.sockets.on('connection', function (socket) {
         var clientIp = socket.request.connection.remoteAddress;
         console.log("* A client has connected via socket.io from ip: " + clientIp);
      });
      exports.updateGroupList = function(group) {
         if(Config.VerboseDebug) console.log("Emitting group change to socket.io clients: ".yellow + JSON.stringify(group, null, 2));
         io.sockets.emit('updateGroupList', group);
      }
      waterfall_callback(null);
   }
   ], function(err) {
      if(err && Config.Debug) console.log("(Debug) Received error after async waterfall in server.js: " + err);
   }
);
