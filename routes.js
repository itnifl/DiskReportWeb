var Edge = require('edge');  //https://github.com/tjanczuk/edge/tree/master#scripting-clr-from-nodejs
var Path = require('path');
var Colors = require('colors');
var Config = require('./config');
var MongoDB = require('./mongodb');
var CommonJS = require('./commonServerSideJS.js');
var root = require('./server.js');
var Async = require("async");
var Util = require('util');

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
  	if (Config.Debug) Util.log("* [GroupAdmin] Getting all defined groups.");
  	if (Config.VerboseDebug) Util.log("(VerboseDebug) Using collection: ".yellow + Config.GroupCollection + ", in database: " + Config.Database);
  	mongodb.open(Config.GroupCollection, function(connectionResponse) {
	    mongodb.getGroups(filter, function(groupInfo) {
	    	if(Config.VerboseDebug) Util.log('(VerboseDebug) Successfully got info on server groups: '.yellow + JSON.stringify(groupInfo, null, 2));        
			if(CommonJS.isFunction(callBack)) callBack(groupInfo);            
	    });      
  	});
}
function addGroup(groupName, callBack) {
	var mongodb = new MongoDB(Config.MongoServer, Config.MongoPort);
  	if (Config.Debug) Util.log("* [GroupAdmin] Adding empty group: " + groupName);
  	if (Config.VerboseDebug) Util.log("(VerboseDebug) Using collection: ".yellow + Config.GroupCollection + ", in database: " + Config.Database);
  	mongodb.open(Config.GroupCollection, function(connectionResponse) {
  		if (Config.VerboseDebug) Util.log("(VerboseDebug) Initiating collection connect..".yellow);
	    mongodb.addGroup(groupName, function(saveInfo) {
	    	if(Config.VerboseDebug && saveInfo.status) Util.log('(VerboseDebug) Successfully saved empty group, got reply: '.yellow + JSON.stringify(saveInfo, null, 2));
	    	if(Config.VerboseDebug && !saveInfo.status) Util.log('(VerboseDebug) Failed to save empty group, got reply: '.red + JSON.stringify(saveInfo, null, 2));        
			if(CommonJS.isFunction(callBack)) callBack(saveInfo);            
	    });      
  	});
}
function deleteGroup(groupName, callBack) {
	var mongodb = new MongoDB(Config.MongoServer, Config.MongoPort);
  	if (Config.Debug) Util.log("* [GroupAdmin] Deleting group: " + groupName);
  	if (Config.VerboseDebug) Util.log("(VerboseDebug) Using collection: ".yellow + Config.GroupCollection + ", in database: " + Config.Database);
  	mongodb.open(Config.GroupCollection, function(connectionResponse) {
  		if (Config.VerboseDebug) Util.log("(VerboseDebug) Initiating collection connect..".yellow);
	    mongodb.deleteGroup(groupName, function(deleteInfo) {
	    	if(Config.VerboseDebug && deleteInfo.status) Util.log('(VerboseDebug) Successfully deleted group, got reply: '.yellow + JSON.stringify(deleteInfo, null, 2));
	    	if(Config.VerboseDebug && !deleteInfo.status) Util.log('(VerboseDebug) Failed to delete group, got reply: '.red + JSON.stringify(deleteInfo, null, 2));        
			if(CommonJS.isFunction(callBack)) callBack(deleteInfo);            
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
	    			Util.log("[Default route](VerboseDebug) Found servers:".yellow);
	    			Util.log(JSON.stringify(servers, null, 2));
	    		}
	    		servers.Collection = servers.ServerCollection;
	    		delete servers.ServerCollection;
			    reply.view('index', { title: 'Welcome to Disk Reporting', body: servers });
			});
	    }
	});
	HapiServer.route({
	    method: 'GET',
	    path: '/GroupAdmin',
	    handler: function (request, reply) {
	    	getGroups('', function(groupInfo) {
	    		groupInfo.Collection = groupInfo.Groups;
	    		delete groupInfo.Groups;
	    		reply.view('groupAdmin', { title: 'Group Admin', body: groupInfo, url: "http://" + Config.Hostname + ":" + Config.SocketIOPort });
	    	});			
	    }
	});
	HapiServer.route({
	    method: 'POST',
	    path: '/GroupAdmin',
	    handler: function (request, reply) {
	    	if(Config.Debug) { 
	    		Util.log('(Debug)Received request to create group: ' + JSON.stringify(request.payload, null, 2)); 
	    	}
	    	addGroup(request.payload.groupName, function(saveInfo) {
	    		if(saveInfo.status) {
	    			root.updateGroupList(saveInfo);
	    			reply({ "success": true }).code(201);
	    		} else reply({ "success": false }).code(304);
	    	});
	    		
	    }
	});
	HapiServer.route({
	    method: 'DELETE',
	    path: '/GroupAdmin',
	    handler: function (request, reply) {
	    	if(Config.Debug) { 
	    		Util.log('(Debug)Received request to delete group(s): ' + JSON.stringify(request.payload, null, 2)); 
	    	}
	    	if(request.payload.groupName.constructor === Array) {
	    		var ourResultArray = new Array();
	    		var ourStatus = false;
	    		if(Config.VerboseDebug) Util.log("Determined that request.payload.groupName is an array.. ".yellow);

				Async.waterfall([
				   function(waterfall_callback) {
				   		request.payload.groupName.forEach(function(item) {
				    		deleteGroup(item, function(deleteInfo) {
				    			var returnPayload = {"delete": true, "status": deleteInfo.status, "name": item};
					    		ourResultArray.push(returnPayload);
					    		if(deleteInfo.status) {
					    			ourStatus = deleteInfo.status;
					    			root.updateGroupList(returnPayload);
					    		}
				    		});		    		
				    	});
				      	waterfall_callback(null);
				   },
				   function(waterfall_callback) {
				   		if(ourStatus) {
		    				if(Config.VerboseDebug) Util.log("Initiating group change to socket.io clients: ".yellow + JSON.stringify(ourResultArray, null, 2));	    					
		    				reply({ "success": true }).code(200);
	    				} else reply({ "success": false }).code(304);
				      	waterfall_callback(null);
				   	}
				   ], function(err) {
				      if(err && Config.Debug) Util.log("(Debug) Received error after async waterfall in method: 'DELETE', path: '/GroupAdmin': " + err);
				   }
				);
	    	} else {
	    		deleteGroup(request.payload.groupName, function(deleteInfo) {
		    		if(deleteInfo.status) {
		    			var returnPayload = {"delete": true, "status": deleteInfo.status, "name": request.payload.groupName};
		    			if(Config.VerboseDebug) Util.log("Initiating group change to socket.io clients: ".yellow + returnPayload);
		    			root.updateGroupList(returnPayload);
		    			reply({ "success": true }).code(200);
		    		} else {
		    			if(Config.VerboseDebug) Util.log("Something failed: ".yellow + JSON.stringify(deleteInfo, null, 2));
		    			reply({ "success": false }).code(304);
		    		}
	    		});
	    	}
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
	    			Util.log("(VerboseDebug)Found servers when using route /ServerList:".yellow);
	    			Util.log(JSON.stringify(servers, null, 2));
	    		}
			    reply({
		            "servers": servers
		        }).code(200);
	    	});
	    }
	});
}
