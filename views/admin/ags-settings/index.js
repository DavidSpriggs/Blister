'use strict';

exports.find = function(req, res, next) {
	console.log("find");
	req.query.serviceUrl = req.query.serviceUrl ? req.query.serviceUrl : '';
	req.query.userIdColumnName = req.query.userIdColumnName ? req.query.userIdColumnName : '';
	req.query.limit = req.query.limit ? parseInt(req.query.limit, null) : 20;
	req.query.page = req.query.page ? parseInt(req.query.page, null) : 1;
	req.query.sort = req.query.sort ? req.query.sort : '_id';

	var filters = {};
	if (req.query.serviceUrl) {
		filters.serviceUrl = new RegExp('^.*?' + req.query.serviceUrl + '.*$', 'i');
	}
	if (req.query.userIdColumnName) {
		filters.userIdColumnName = new RegExp('^.*?' + req.query.userIdColumnName + '.*$', 'i');
	}

	req.app.db.models.AGSLayers.pagedFind({
		filters: filters,
		keys: 'serviceUrl userIdColumnName',
		limit: req.query.limit,
		page: req.query.page,
		sort: req.query.sort
	}, function(err, results) {
		console.log("results:", results);
		if (err) {
			return next(err);
		}

		if (req.xhr) {
			res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
			results.filters = req.query;
			res.send(results);
		} else {
			results.filters = req.query;
			res.render('admin/ags-settings/index', {
				data: {
					results: escape(JSON.stringify(results))
				}
			});
		}
	});
};

exports.read = function(req, res, next){
  req.app.db.models.AGSLayers.findById(req.params.id).exec(function(err, agsItem) {
    if (err) {
      return next(err);
    }

    if (req.xhr) {
      res.send(agsItem);
    }
    else {
      res.render('admin/ags-settings/details', { data: { record: escape(JSON.stringify(agsItem)) } });
    }
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

exports.update = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.user.roles.admin.isMemberOf('root')) {
      workflow.outcome.errors.push('You may not update categories.');
      return workflow.emit('response');
    }

    if (!req.body.serviceUrl) {
      workflow.outcome.errfor.serviceUrl = 'serviceUrl';
      return workflow.emit('response');
    }

    if (!req.body.userIdColumnName) {
      workflow.outcome.errfor.userIdColumnName = 'required';
      return workflow.emit('response');
    }

    workflow.emit('patchAGSLayers');
  });

  workflow.on('patchAGSLayers', function() {
    var fieldsToSet = {
      serviceUrl: req.body.serviceUrl,
      userIdColumnName: req.body.userIdColumnName
    };

    req.app.db.models.AGSLayers.findByIdAndUpdate(req.params.id, fieldsToSet, function(err, category) {
      if (err) {
        return workflow.emit('exception', err);
      }

      workflow.outcome.category = category;
      return workflow.emit('response');
    });
  });

  workflow.emit('validate');
};

exports.delete = function(req, res, next){
  var workflow = req.app.utility.workflow(req, res);

  workflow.on('validate', function() {
    if (!req.user.roles.admin.isMemberOf('root')) {
      workflow.outcome.errors.push('You may not delete AGS layer settings.');
      return workflow.emit('response');
    }

    workflow.emit('deleteAGSLayers');
  });

  workflow.on('deleteAGSLayers', function(err) {
    req.app.db.models.AGSLayers.findByIdAndRemove(req.params.id, function(err, category) {
      if (err) {
        return workflow.emit('exception', err);
      }
      workflow.emit('response');
    });
  });

  workflow.emit('validate');
};