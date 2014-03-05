'use strict';

var util = require('./util'),
	request = require('request');

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
						res.json({
							"success": false,
							"message": "Problem with request."
						});
					}

				} else {
					res.json({
						"success": false,
						"message": "Problem with request."
					});
				}

			} else {
				// no features? What are you adding???!?
				res.json({
					"success": false,
					"message": "Problem with request."
				});
			}
		} else {
			res.json({
				"success": false,
				"message": "This service not in config."
			});
		}
	});
};