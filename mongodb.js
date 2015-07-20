var mongodb = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
var Config = require('./config');
var Colors = require('colors');
var CommonJS = require('./commonServerSideJS.js');
var Util = require('util');

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
	if(Config.VerboseDebug) Util.log('DB connection status at open call is: '.yellow + this.db._state + "..");
	if(this.db._state != 'connecting' && this.db._state != 'connected') {
		this.db.open(function(err, db) {
		    if (!err) {
		        if (Config.Debug) Util.log("(Debug) Connected to the '" + Config.Database + "' database and '" + collection + "' collection, the connection status is now open..");
				db.collection(collection, {strict:true}, function(err, result) {
				    if (err && Config.Debug) Util.log("(Debug) Something happened when connecting to the '" + collection + "' collection: " + err);
                    if(CommonJS.isFunction(responseHandler)) responseHandler(err);
		        });                
		    } else {
		    	if (Config.Debug) Util.log("(Debug) Failed connecting to '" + Config.Database + "' database: " + err);
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
    if (Config.VerboseDebug) Util.log('Saving groupObj: ' + JSON.stringify(groupObj, undefined, 2));
 	if (Config.Debug) Util.log('(Debug) Saving group to mongodb: ' + groupObj.name);

    if(groupObj.hasOwnProperty("Warning")) delete groupObj.Warning;

    this.db.collection(Config.GroupCollection, function(err, collection) {
    	if(err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
    	if (Config.Debug) Util.log('(Debug) Attempting to upsert group: ' + groupObj.name);
        collection.update({"name": groupObj.Name}, groupObj, {safe:true, upsert:true}, function(err, result) {
            if (err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
            if (!err && Config.Debug) Util.log('(Debug).. save success!'.blue);
            if(CommonJS.isFunction(responseHandler)) responseHandler({status: true});
        });
    });
};

/**
 * deleteGroup function.
 * @param {String} groupName A group name to remove
 * @param {Function} responseHandler ResponseHandler Callback
 */
MongoDB.prototype.deleteGroup = function(groupName, responseHandler) {
    this.db.collection(Config.GroupCollection, function(err, collection) {
        if(err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
        if (Config.Debug) Util.log('(Debug) Attempting to remove group: ' + groupName);
        collection.remove({"name": groupName}, function(err, result) {
            if (err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
            if (!err && Config.Debug) Util.log('(Debug) .. remove was successful!'.blue);
            if(CommonJS.isFunction(responseHandler)) responseHandler({status: true});
        });
    });
};

/**
 * addGroup function. Creates a empty group with a specified name. 
 * @param {String} grouName A group represented as jSON to be stored in the database
 * @param {Function} responseHandler ResponseHandler Callback
 */
MongoDB.prototype.addGroup = function(groupName, responseHandler) {
    var groupObj = {
        "name": groupName,
        "servers": []
    }
    if (Config.VerboseDebug) Util.log('Saving groupObj: ' + JSON.stringify(groupObj, undefined, 2));
    if (Config.Debug) Util.log('(Debug) Saving group to mongodb: ' + groupObj.name);

    if(groupObj.hasOwnProperty("Warning")) delete groupObj.Warning;

    this.db.collection(Config.GroupCollection, function(err, collection) {
        if(err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});
        if (Config.Debug) Util.log('(Debug) Attempting to create new group: ' + groupObj.Name);
        collection.update({"name": groupObj.Name}, groupObj, {safe:true, upsert:true}, function(err, result) {
            if (err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});            
            if(!err) {
                if (Config.Debug) Util.log('(Debug) .. save success!'.blue);
                if (CommonJS.isFunction(responseHandler)) responseHandler({status: true, group: groupObj})
            };
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
    if (Config.Debug) Util.log('(Debug) Retrieving groups from mongodb with filter: "' + filter +'"');
    
    this.db.collection(Config.GroupCollection, function (err, collection) {
        collection.find().toArray(function (err, groupInfo) {
            if (groupInfo && groupInfo.length > 0) { 
                if (Config.Debug && !Config.VerboseDebug) Util.log("(Debug) Found this amount of groups in mongodb: " + groupInfo.length + "..");
                if(filter && filter != "") {
                    groupInfo = groupInfo.filter(function (el) {
                        return (el.name === filter);
                    });
                }
                groupInfo.forEach(function(item) {
                    item.idName = CommonJS.fixMyID(item.name);
                });
                groupInfo = {
                    "Groups": groupInfo
                }; 
                if (Config.VerboseDebug) Util.log("(VerboseDebug) Replying with: ".yellow + JSON.stringify(groupInfo, null, 2));
            } else {
                groupInfo = {
                    "Groups": [
                        {
                            "idName": CommonJS.fixMyID("No groups found"),
                            "name": "No groups found",
                            "servers": []
                        }
                    ]
                };
                if(Config.Debug) Util.log("(Debug) Found no groups using filter: '" + filter + "'..");
            }
            if(CommonJS.isFunction(responseHandler)) responseHandler(groupInfo);
        });
    });
};

/**
 * renameGroup function.
 * @param String oldName 
 * @param String newName 
 * @param {Function} responseHandler ResponseHandler Callback
 * Renames a group identified by its old name.
 */
MongoDB.prototype.renameGroup = function(oldName, newName, responseHandler) {
    if (Config.Debug) Util.log('(Debug) Attempting to rename group: "' + oldName +'", to: ' + newName);
    
    this.db.collection(Config.GroupCollection, function (err, collection) {
        collection.update({ name: oldName }, { $set: { "name": newName } }, function (err, result) {            
            if (err && CommonJS.isFunction(responseHandler)) return responseHandler({status: false, error: err});            
            if (!err) {
                if (Config.Debug) Util.log('(Debug).. rename of group was a success!'.blue);
                if (CommonJS.isFunction(responseHandler)) responseHandler({status: true, name: newName, result: result});
            }
        });
    });
};

module.exports = MongoDB;