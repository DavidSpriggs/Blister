'use strict';
var request = require('request');
// Given a path in the form /arcgis/***, determine if there
// is a corresponding URL saved in the Blister Config,
// and return that service URL and USER_ID column.
exports.determineIfServiceInSystem = function(req, path, callback) {
	var compareKey = path.split("/");
	if (compareKey.length > 1) {
		compareKey = compareKey[2];
		// part of url after /arcgis/ should match last part of settings.
		req.app.db.models.AGSLayers.find({}, /* TODO - figure out how to query */ 'serviceUrl userIdColumnName', function(err, docs) {
			var didCallback = false;
			docs.forEach(function(doc) {
				if (doc.serviceUrl) {
					if (doc.serviceUrl.lastIndexOf(compareKey) > 0) {
						if (callback) {
							didCallback = true;
							callback(doc);
						}
					}
				}
			});
			// got through all - no matched
			if (!didCallback && callback) {
				callback(false);
			}
		});
	}
};

exports.getSubUrl = function(path, callback) {
	var subUrl = path.split("/");
	if (subUrl.length > 2) {
		var startPosition = subUrl[0].length + subUrl[1].length + subUrl[2].length + 2;
		subUrl = path.substring(startPosition, path.length);
		return subUrl;
	}
	return path;
};

exports.getOwnedOids = function(url, columnName, userId, callback, errBack) {
	var retOids = [];
	var index = url.lastIndexOf("/");
	var queryUrl = url.substring(0, index) + "/query";
	var reqObj = {
		"method": "GET",
		"uri": queryUrl,
		"qs": {
			"where": columnName + " = '" + userId + "'",
			"f": "json",
			"outFields": "*"
		}
	};
	request(reqObj, function(error, response, body) {
		if (!error) {
			if (callback && isValidJson(body)) {
				var json = JSON.parse(body);
				json.features.forEach(function(feature) {
					retOids.push(feature.attributes.OBJECTID);
				});
				callback(retOids);
			} else {
				if (errBack) {
					errBack("Problem with querying");
				}
			}
		} else {
			if (errBack) {
				errBack(error);
			}
		}
	});
};

function isValidJson(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}