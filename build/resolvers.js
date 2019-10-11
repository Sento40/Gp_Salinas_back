'use strict';

var _mongoose = require('mongoose');

var _require = require('graphql-subscriptions'),
    PubSub = _require.PubSub,
    withFilter = _require.withFilter;

var pubsub = new PubSub();
var mongoose = require('mongoose');


var messages = [];

var Message = mongoose.model('Message', {
  "device": {
    type: String,
    required: true
  },
  "timestamp": {
    type: Number,
    required: true
  },
  "data": {
    type: String,
    required: true
  } });

var resolvers = {
  Query: {
    getMessages: function getMessages(parentValue, params) {
      var messages = Message.find().exec();
      return messages;
    }
  },
  Mutation: {
    addMessage: function addMessage(parentValue, _ref) {
      var device = _ref.device,
          timestamp = _ref.timestamp,
          data = _ref.data;

      messages.push({ device: device, timestamp: timestamp, data: data });

      var mess = new Message({ device: device, data: data, timestamp: timestamp });
      mess.save().then(function () {
        return console.log("message creado");
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
  Message: Message
};