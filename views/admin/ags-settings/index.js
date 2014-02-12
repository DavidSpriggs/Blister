'use strict';

exports.find = function(req, res, next) {
	res.render('admin/ags-settings/index', {
		data: {}
	});
};

exports.read = function(req, res, next) {
	res.render('admin/ags-settings/details', {
		data: {}
	});
};

exports.create = function(req, res, next) {
	console.log("exports.create!");
	var workflow = req.app.utility.workflow(req, res);

	workflow.on('validate', function() {
		if (!req.user.roles.admin.isMemberOf('root')) {
			workflow.outcome.errors.push('You may not create categories.');
			return workflow.emit('response');
		}

		if (!req.body.serviceUrl) {
			workflow.outcome.errors.push('A service URL is required.');
			return workflow.emit('response');
		}

		if (!req.body.userIdColumnName) {
			workflow.outcome.errors.push('A user ID column name is required.');
			return workflow.emit('response');
		}

		workflow.emit('duplicateServiceUrlCheck');
	});

	workflow.on('duplicateServiceUrlCheck', function() {
		console.log("duplicateServiceUrlCheck");
		req.app.db.models.AGSLayers.findById(req.app.utility.slugify(req.body.serviceUrl)).exec(function(err, serviceUrl) {
			if (err) {
				return workflow.emit('exception', err);
			}

			if (serviceUrl) {
				workflow.outcome.errors.push('That serviceUrl is already taken.');
				return workflow.emit('response');
			}

			workflow.emit('createAGSLayer');
		});
	});

	workflow.on('createAGSLayer', function() {
		console.log("createAGSLayer", req.body.serviceUrl, req.body.userIdColumnName);
		var fieldsToSet = {
			_id: req.app.utility.slugify(req.body.serviceUrl),
			serviceUrl: req.body.serviceUrl,
			userIdColumnName: req.body.userIdColumnName
		};

		req.app.db.models.AGSLayers.create(fieldsToSet, function(err, serviceUrl) {
			if (err) {
				return workflow.emit('exception', err);
			}

			workflow.outcome.record = serviceUrl;
			return workflow.emit('response');
		});
	});

	workflow.emit('validate');
};