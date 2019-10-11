'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  'device': {
    type: String,
    required: true
  },
  'timestamp': {
    type: String,
    required: true
  },
  'data': {
    type: String,
    required: true
  }
}, { collection: 'Message', timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);