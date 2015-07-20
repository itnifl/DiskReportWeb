var Config = require('./config');
var Routes = require('./routes');
var Hapi = require('hapi'); //http://hapijs.com/tutorials
var Async = require("async");
var Colors = require('colors');
var Util = require('util');
var MongoDB = require('./mongodb');
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

Async.waterfall([
   function(waterfall_callback) {
      io = require('socket.io').listen(hapiServer.select('io').listener, function() {
         Util.log('socket.io listening on *:' + hapiServer.select('io').listener);
      });  
      waterfall_callback(null);
   },
   function(waterfall_callback) {
      Routes.addRoutes(hapiServer.select('http'));

      hapiServer.start(function () {
         Util.log('Server running at:', hapiServer.info.uri);
      });
      io.sockets.on('connection', function (socket) {
        var clientIp = socket.request.connection.remoteAddress;
        Util.log("A client has connected via socket.io from ip: " + clientIp);
        socket.on('error', function (err) { 
          Util.log('Received an error while using socket.io: '.red);
          Util.log(err.stack);
        });
        /**
         * @param {Object} data - {newName, oldName}
         * @param {Function} callBack - with signature function(errorBool, messageString) {}
         * Renames a group
         */
        socket.on('renameGroup', function (data, callBack) { //callBack here is with signature function(errorBool, messageString){}
          if(Config.Debug) Util.log('Received request from client to rename group: ', data);
          var dataObj = typeof data =='object' ? data : JSON.parse(data);     
          if(Config.VerboseDebug) Util.log('Parsed to: ' + JSON.stringify(dataObj, null, 2));          
          var mongodb = new MongoDB(Config.MongoServer, Config.MongoPort);          
          mongodb.open(Config.GroupCollection, function(connectionResponse) {
            if (Config.VerboseDebug) Util.log("(VerboseDebug) Initiating collection connect to rename group..".yellow);
            mongodb.renameGroup(dataObj.oldName, dataObj.newName, function(dataAnswer) {
              if(!dataAnswer.status && Config.Debug) {
                Util.log('.. rename of group failed!'.red);
                Util.log(dataAnswer.error);
                callBack(true, dataAnswer.error);
              } else if(dataAnswer.status) {
                io.sockets.emit('updateGroupList', {status: true, delete: true, name: dataObj.oldName });
                io.sockets.emit('updateGroupList', dataAnswer);
                callBack(false, 'All OK!');
              }              
            });    
          });          
        });
        /**
         * @param {String} groupName - Name of group
         * @param {Function} callBack - with signature function(errorBool, messageJSON) {}
         * Fetches a group and its members
         */
        socket.on('getGroup', function (groupName, callBack) { //callBack here is with signature function(errorBool, messageJSON){}
          if(Config.Debug) Util.log('Received request from client to fetch group: ', groupName);          
          var mongodb = new MongoDB(Config.MongoServer, Config.MongoPort);          
          mongodb.open(Config.GroupCollection, function(connectionResponse) {
            if (Config.VerboseDebug) Util.log("(VerboseDebug) Initiating collection connect to fetch group..".yellow);
            mongodb.getGroups(groupName, function(groupInfo) {
              if(groupInfo.hasOwnProperty('Groups') && !(groupInfo.Groups.length > 0) && Config.Debug) {
                Util.log('.. fetch of group " '.red + groupName +' " failed!'.red);
                Util.log(groupInfo.error);
                callBack(true, groupInfo.error);
              } else if(groupInfo.hasOwnProperty('Groups') && groupInfo.Groups.length > 0) {
                if (Config.VerboseDebug) Util.log("(VerboseDebug) Returning fetched group to callback..");
                callBack(false, groupInfo);
              }              
            });    
          });
        });
      });
      exports.updateGroupList = function(group) {
         if(Config.VerboseDebug) Util.log("Emitting group change to socket.io clients: ".yellow + JSON.stringify(group, null, 2));
         io.sockets.emit('updateGroupList', group);
      }
      waterfall_callback(null);
   }
   ], function(err) {
      if(err && Config.Debug) Util.log("(Debug) Received error after async waterfall in server.js: " + err);
   }
);
