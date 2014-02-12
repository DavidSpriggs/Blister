'use strict';

exports = module.exports = function(app, mongoose) {
  var agsLayersSchema = new mongoose.Schema({
    _id: { type: String },
    serviceUrl: { type: String, default: '' },
    userIdColumnName: { type: String, default: '' }
  });
  agsLayersSchema.plugin(require('./plugins/pagedFind'));
  agsLayersSchema.index({ serviceUrl: 1 });
  agsLayersSchema.index({ userIdColumnName: 1 });
  agsLayersSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('AGSLayers', agsLayersSchema);
};
