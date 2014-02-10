'use strict';

exports.find = function(req, res, next){
  res.render('admin/ags-settings/index', { data: {  } });
};

exports.read = function(req, res, next){
  res.render('admin/ags-settings/details', { data: {  } });
};

