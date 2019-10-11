const {PubSub, withFilter} = require('graphql-subscriptions');
const pubsub = new PubSub();
const moongose = require('mongoose');
import {Schema} from 'mongoose';
import Message from './models/Message'

const messages = [];

const Messages = Message;

const resolvers = {
  Query: {
    getMessages(_parentValue, _params) {
      const messages = Messages.find().exec()
      return messages
    }
  },
  Mutation: {
    addMessage(_parentValue, {device, timestamp, data}) {
      messages.push({device, timestamp, data});

      const mess = new Messages({device:device, timestamp:timestamp, data:data});
      mess.save().then((result) => {
        console.log("Message created");
      }).catch((err) => {
        console.log("Error en addMessage", err);
      });

      pubsub.publish('newMessageAdded', {
        newMessageAdded: {device, timestamp, data}
      })

      return messages
    }
  },
  Subscription: {
    newMessageAdded: {
      subscribe: withFilter(
          () => pubsub.asyncIterator('newMessageAdded'),
          (params, variables) => true
      ),
    },
  }
}

module.exports = {
  resolvers,
  Messages
}