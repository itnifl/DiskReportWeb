var Edge = require('edge');  //https://github.com/tjanczuk/edge/tree/master#scripting-clr-from-nodejs
var CommonJS = require('./commonServerSideJS.js');
function getServers(callBack) {
	var doGetServers = Edge.func({
	    source: function() {/*

			using System;
	        using System.Data;
	        using System.IO;
	        using System.Threading.Tasks;
	        using DiskReporter;

	        public class Startup {
	        	string configDirectory = Directory.GetCurrentDirectory();
		        string tsmConfig = System.IO.Path.VolumeSeparatorChar + "config_TSMServers.xml";
		        string vCenterConfig = System.IO.Path.VolumeSeparatorChar + "config_vCenterServer.xml";         
		        string logName = "DiskReporter.log";

	            public async Task<object> Invoke(dynamic input) {
	                StreamWriter log;
					if (!File.Exists(logName)) {
						log = new StreamWriter(logName);
			        } else {
						log = File.AppendText(logName);
			        }
			    	DiskReporterMainRunFlows programFlow = new DiskReporterMainRunFlows(log);
			    	var result = programFlow.FetchTsmVMwareNodeData(
                    	configDirectory + tsmConfig,
                    	configDirectory + vCenterConfig, 
						serverNameFilter: String.Empty);

					System.Collections.Specialized.OrderedDictionary vmwareNodeDictionary = result.Item1;
					System.Collections.Specialized.OrderedDictionary tsmNodeDictionary = result.Item2;

					return vmwareNodeDictionary;
	            }
	        }
	    */},
	    references: [ './dll-sources/DiskReporter.dll', 'System.Data.dll', 'System.IO.dll', 'mscorlib.dll' ]
	});
	doGetServers(null, function (error, result) {
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
			    reply.view('index', { title: 'Welcome to Disk Reporting', body: { "servers": [{"Name": "server1"}, {"Name": "server2"}, {"Name": "server3"}] } });
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
		//Not roperly implemented:
		//We need to actually get the servers from the C# library
	    method: 'GET',
	    path: '/serverlist',
	    handler: function (request, reply) {
	        'use strict';
	        reply({
	            "servers": [{"Name": "server1"}, {"Name": "server2"}, {"Name": "server3"}]
	        }).code(200);
	    }
	});
}
