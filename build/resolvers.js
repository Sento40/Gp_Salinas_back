'use strict';

var _mongoose = require('mongoose');

var _Message = require('./models/Message');

var _Message2 = _interopRequireDefault(_Message);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('graphql-subscriptions'),
    PubSub = _require.PubSub,
    withFilter = _require.withFilter;

var pubsub = new PubSub();
var moongose = require('mongoose');


var messages = [];

var Messages = _Message2.default;

var resolvers = {
  Query: {
    getMessages: function getMessages(_parentValue, _params) {
      var messages = Messages.find().exec();
      return messages;
    }
  },
  Mutation: {
    addMessage: function addMessage(_parentValue, _ref) {
      var device = _ref.device,
          timestamp = _ref.timestamp,
          data = _ref.data;

      messages.push({ device: device, timestamp: timestamp, data: data });

      var mess = new Messages({ device: device, timestamp: timestamp, data: data });
      mess.save().then(function (result) {
        console.log("Message created");
      }).catch(function (err) {
        console.log("Error en addMessage", err);
      });

      pubsub.publish('newMessageAdded', {
        newMessageAdded: { device: device, timestamp: timestamp, data: data }
      });

      return messages;
    }
  },
  Subscription: {
    newMessageAdded: {
      subscribe: withFilter(function () {
        return pubsub.asyncIterator('newMessageAdded');
      }, function (params, variables) {
        return true;
      })
    }
  }
};

module.exports = {
  resolvers: resolvers,
  Messages: Messages
};