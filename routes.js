var Edge = require('edge');  //https://github.com/tjanczuk/edge/tree/master#scripting-clr-from-nodejs
var Path = require('path');
var Colors = require('colors');
var Config = require('./config');
var MongoDB = require('./mongodb');
var CommonJS = require('./commonServerSideJS.js');

function getServers(callBack) {
	var doGetServers = Edge.func({
    	assemblyFile: Path.join(__dirname, 'dll-sources', 'DiskReporter.dll'),
    	typeName: 'DiskReporter.drNodeEdgeIntegration',
   		methodName: 'FetchVMwareAndTSMServerData' // This must be Func<object,Task<object>>
	});
	doGetServers('dll-sources', function (error, result) {
		if (error) throw error;
		if(CommonJS.isFunction(callBack)) callBack(result);
	});
}
function getGroups(filter, callBack) {
	var mongodb = new MongoDB(Config.MongoServer, Config.MongoPort);
  	if (Config.Debug) console.log("* [GroupAdmin] Getting all defined groups.");
  	if (Config.VerboseDebug) console.log("(VerboseDebug) Using collection: " + Config.GroupCollection + ", in database: " + Config.Database + "".yellow);
  	mongodb.open(Config.Database, function(connectionResponse) {
	    mongodb.getGroups(filter, function(groupInfo) {
	    	if(Config.VerboseDebug) console.log('(VerboseDebug) Successfully got info on server groups: '+ JSON.stringify(groupInfo, null, 2) + "".yellow);        
			if(CommonJS.isFunction(callBack)) callBack(groupInfo);            
	    });      
  	});
}

exports.addRoutes = function (HapiServer) {
	HapiServer.route({
	    method: 'GET',
	    path: '/',
	    handler: function (request, reply) {
	    	getServers(function (servers) {
	    		if(Config.VerboseDebug) {
	    			console.log("[Default route](VerboseDebug) Found servers:".yellow);
	    			console.log(JSON.stringify(servers, null, 2));
	    		}
			    reply.view('index', { title: 'Welcome to Disk Reporting', body: servers });
			});
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/GroupAdmin',
	    handler: function (request, reply) {
	    	getGroups('', function(groupInfo) {
	    		reply.view('groupAdmin', { title: 'Group Admin', body: groupInfo });
	    	});			
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/AdvancedFilter',
	    handler: function (request, reply) {
			reply.view('advancedFilter', { title: 'Advanced Filter', body: '' });
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/css/{filename*}',
	    handler: {
	        directory: {
	            path:    __dirname + '/public/css',
				listing: false,
				index: false
	        }
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/js/{filename*}',
	    handler: {
	        directory: {
	            path:    __dirname + '/public/js',
				listing: false,
				index: false
	        }
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/images/{filename*}',
	    handler: {
	        directory: {
	            path:    __dirname + '/public/images',
				listing: false,
				index: false
	        }
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/{filename*}',
	    handler: {
	        directory: {
	            path:    __dirname + '/public',
				listing: false,
				index: false
	        }
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/ServerList',
	    handler: function (request, reply) {
	        'use strict';	        
	        getServers(function (servers) {
	    		if(Config.VerboseDebug) {
	    			console.log("(VerboseDebug)Found servers when using route /ServerList:".yellow);
	    			console.log(JSON.stringify(servers, null, 2));
	    		}
			    reply({
		            "servers": servers
		        }).code(200);
	    	});
	    }
	});
}
