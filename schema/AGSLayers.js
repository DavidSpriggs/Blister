'use strict';

exports = module.exports = function(app, mongoose) {
  var agsLayersSchema = new mongoose.Schema({
    _id: { type: String },
    layerUrl: { type: String, default: '' },
    userIdColumn: { type: String, default: '' }
  });
  agsLayersSchema.plugin(require('./plugins/pagedFind'));
  agsLayersSchema.index({ layerUrl: 1 });
  agsLayersSchema.index({ userIdColumn: 1 });
  agsLayersSchema.set('autoIndex', (app.get('env') === 'development'));
  app.db.model('AGSLayers', agsLayersSchema);
};
