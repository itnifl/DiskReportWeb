var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var Config = require('./config');
var Colors = require('colors');
var CommonJS = require('./commonServerSideJS.js');

/**
 * Constructor.
 * 
 * @class MongoDB
 * @constructor
 * @param String mongoServer Address or hostname of mongodb server to connect to.
 * @param Integer mongoPort The port number that the mongodb server listens to.
 */
function MongoDB(mongoServer, mongoPort) {
  	var mongoServer = new mongodb.Server(mongoServer, mongoPort, { auto_reconnect: true });
	this.db = new mongodb.Db(Config.Database, mongoServer, { safe: true });				
};


/**
 * close database connection function.
 */
MongoDB.prototype.close = function() {
	this.db.close();	 
}

/**
 * open database connection function.
 * @param String collection Name of the collection to use in our database
 * @param {Function} responseHandler ResponseHandler Callback
 * Initial database operations should be handeled in callback.
 */
MongoDB.prototype.open = function(collection, responseHandler) {
	if(Config.VerboseDebug) console.log('DB connection status at open call is: ' + this.db._state + "..".yellow);
	if(this.db._state != 'connecting' && this.db._state != 'connected') {
		this.db.open(function(err, db) {
		    if (!err) {
		        if (Config.Debug) console.log("Connected to the '" + Config.Database + "' database, the connection status is now open..");
				db.collection(collection, {strict:true}, function(err, collection) {
				    if (err && Config.Debug) console.log("Something happened when connecting to the '" + collection + "' collection: " + err);
                    if(CommonJS.isFunction(responseHandler)) responseHandler(err);
		        });                
		    } else {
		    	if (Config.Debug) console.log("Failed connecting to '" + Config.Database + "' database: " + err);
                if(CommonJS.isFunction(responseHandler)) responseHandler(err);
		    }		     
		});	
	} else if(this.db._state == 'connected') {
		if(CommonJS.isFunction(responseHandler)) responseHandler(undefined);
	}
}

/**
 * saveGroup function.
 * @param {Object} groupAsjSon A group represented as jSON to be stored in the database
 * @param {Function} responseHandler ResponseHandler Callback
 */
MongoDB.prototype.saveGroup = function(groupAsjSon, responseHandler) {
	var groupObj = typeof groupAsjSon =='object' ? groupAsjSon : JSON.parse(groupAsjSon);
    if (Config.VerboseDebug) console.log('Saving groupObj: ' + JSON.stringify(groupObj, undefined, 2));
 	if (Config.Debug) console.log('Saving group to mongodb: ' + groupObj.Name);

    if(groupObj.hasOwnProperty("Warning")) delete groupObj.Warning;

    this.db.collection(Config.GroupCollection, function(err, collection) {
    	if(err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
    	if (Config.Debug) console.log('Attempting to upsert group: ' + groupObj.Name);
        collection.update({"Name": groupObj.Name}, groupObj, {safe:true, upsert:true}, function(err, result) {
            if (err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
            if (Config.Debug) console.log('.. save success!');
            if(CommonJS.isFunction(responseHandler)) responseHandler({status: true});
        });
    });
};

/**
 * getGroups function.
 * @param String filter The name of the group you are searching for, empty string if no filter
 * @param {Function} responseHandler ResponseHandler Callback
 * Returns group(s) and its members as a JSON object
 */
MongoDB.prototype.getGroups = function(filter, responseHandler) {
    if (Config.Debug) console.log('Retrieving groups from mongodb: "' + filter +'"');
    
    this.db.collection(Config.GroupCollection, function (err, collection) {
        collection.findOne({ "Name": filter }, function (err, groupInfo) {
            if (groupInfo) { 
                if (Config.VerboseDebug) console.log("Found group(s) in mongodb: " + JSON.stringify(groupInfo, undefined, 2));     
                if (Config.Debug && !Config.VerboseDebug) console.log("Found this amount of groups in mongodb: " + groupInfo.length + "..");
                if(CommonJS.isFunction(responseHandler)) responseHandler({
                    "Groups": [
                        groupInfo
                    ]
                });
            } else {
                groupInfo = {
                    "Groups": [
                        {
                            "Name": "No groups found",
                            "Servers": []
                        }
                    ]
                };
                if(Config.Debug) console.log("Found no groups using filter: '" + filter + "'..");
                if(CommonJS.isFunction(responseHandler)) responseHandler(groupInfo);
            }
        });
    });
};

module.exports = MongoDB;