'use strict';

var util = require('./util'),
	request = require('request');

exports.fsInfo = function(req, res) {
	var query = req.query;
	var subUrl = util.getSubUrl(req.url);
	util.determineIfServiceInSystem(req, req.url, function(didMatch) {
		if (didMatch && didMatch.userIdColumnName) {

			var requestObj = {
				"rejectUnauthorized": false,
				"method": "GET",
				qs: query,
				uri: didMatch.serviceUrl + subUrl
			};
			request(requestObj).pipe(res);
		} else {
			res.json({
				"success": false,
				"message": "Problem with config."
			});
		}
	});
};

exports.query = function(req, res) {
	var query = req.query;
	var subUrl = util.getSubUrl(req.url);
	util.determineIfServiceInSystem(req, req.url, function(didMatch) {
		if (didMatch && didMatch.userIdColumnName) {
			// Build the query
			if (query.hasOwnProperty('where')) {
				// add to the where clause
				query.where += " AND " + didMatch.userIdColumnName + " = '" + req.session.passport.user + "'";
			} else {
				query.where = didMatch.userIdColumnName + " = '" + req.session.passport.user + "'";
			}

			var requestObj = {
				"method": "GET",
				qs: query,
				uri: didMatch.serviceUrl + subUrl
			};
			request(requestObj).pipe(res);
		} else {
			res.json({
				"success": false,
				"message": "Problem with config."
			});
		}
	});
};

exports.addFeatures = function(req, res) {
	var query = req.body;
	var subUrl = util.getSubUrl(req.url);
	util.determineIfServiceInSystem(req, req.url, function(didMatch) {
		if (didMatch && didMatch.userIdColumnName) {
			if (query.hasOwnProperty('features')) {
				if (query.features) {
					// Get the features, add the user ID to the USER_ID column (as defined in the Blister config).
					var features = JSON.parse(query.features);
					if (features.length > 0) {
						features.forEach(function(feature) {
							feature.attributes[didMatch.userIdColumnName] = req.session.passport.user;
						});
						query.features = JSON.stringify(features);

						var requestObj = {
							"method": "POST",
							form: query,
							uri: didMatch.serviceUrl + subUrl
						};
						request(requestObj).pipe(res);
					} else {
						sendError(res, "Problem with request.");
					}
				} else {
					sendError(res, "Problem with request.");
				}
			} else {
				// no features? What are you adding???!?
				sendError(res, "Problem with request.");
			}
		} else {
			sendError(res, "This service not in config.");
		}
	});
};

exports.updateFeatures = function(req, res) {
	var query = req.body;
	var subUrl = util.getSubUrl(req.url);
	util.determineIfServiceInSystem(req, req.url, function(didMatch) {
		if (didMatch && didMatch.userIdColumnName) {
			if (query.hasOwnProperty('features')) {
				if (query.features) {
					// Get the features, add the user ID to the USER_ID column (as defined in the Blister config).
					var features = JSON.parse(query.features);
					if (features.length > 0) {

						// Get the OBJECTIDs of the features that this user is ALLOWED to update, and only update those features.
						util.getOwnedOids(didMatch.serviceUrl + subUrl, didMatch.userIdColumnName, req.session.passport.user, function(oids) {
							var featuresToUpdate = [];

							features.forEach(function(feature) {
								if (feature.attributes.hasOwnProperty('OBJECTID')) {
									if (oids.indexOf(feature.attributes.OBJECTID) > -1) {
										featuresToUpdate.push(feature);
									}
								}
							});

							// if featuresToUpdate is empty, that none of the features that the user sent in
							// are allowed to be edited.
							if (featuresToUpdate.length > 0) {
								query.features = JSON.stringify(featuresToUpdate);

								var requestObj = {
									"method": "POST",
									form: query,
									uri: didMatch.serviceUrl + subUrl
								};
								request(requestObj).pipe(res);
							} else {
								sendError(res, "No features that you have access to update.");
							}

						}, function(error) {
							console.log(error);
						});

					} else {
						sendError(res, "Problem with request.");
					}
				} else {
					sendError(res, "Problem with request.");
				}
			} else {
				// no features? What are you adding???!?
				sendError(res, "Problem with request.");
			}
		} else {
			sendError(res, "This service not in config.");
		}
	});
};

exports.deleteFeatures = function(req, res) {
	var query = req.body;
	var subUrl = util.getSubUrl(req.url);
	util.determineIfServiceInSystem(req, req.url, function(didMatch) {
		if (didMatch && didMatch.userIdColumnName) {
			util.getOwnedOids(didMatch.serviceUrl + subUrl, didMatch.userIdColumnName, req.session.passport.user, function(oids) {
				if (query.hasOwnProperty('where')) {
					query.where = query.where + " AND OBJECTID IN (" + oids.join(",") + ")";
					var requestObj = {
						"method": "POST",
						form: query,
						uri: didMatch.serviceUrl + subUrl
					};
					request(requestObj).pipe(res);
				} else {
					// we only allow deleting via where clause for now.
					sendError(res, "Problem with request.");
				}
			}, function(err) {
				console.log("ERROR", err);
			});
		} else {
			sendError(res, "This service not in config.");
		}
	});
};

function sendError(res, message) {
	res.json({
		success: false,
		message: message
	});
	return;
}