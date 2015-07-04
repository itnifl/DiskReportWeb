var Edge = require('edge');  //https://github.com/tjanczuk/edge/tree/master#scripting-clr-from-nodejs
var Path = require('path');
var Colors = require('colors');
var Config = require('./config')

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

exports.addRoutes = function (HapiServer) {
	HapiServer.route({
	    method: 'GET',
	    path: '/',
	    handler: function (request, reply) {
	    	getServers(function (servers) {
	    		if(Config.VerboseDebug) {
	    			console.log("(VerboseDebug)Found servers:".yellow);
	    			console.log(JSON.stringify(servers, null, 2));
	    		}
			    reply.view('index', { title: 'Welcome to Disk Reporting', body: servers });
			});
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
	    path: '/serverlist',
	    handler: function (request, reply) {
	        'use strict';	        
	        getServers(function (servers) {
	    		if(Config.VerboseDebug) {
	    			console.log("(VerboseDebug)Found servers when using route /serverlist:".yellow);
	    			console.log(JSON.stringify(servers, null, 2));
	    		}
			    reply({
		            "servers": servers
		        }).code(200);
	    	});
	    }
	});
}
