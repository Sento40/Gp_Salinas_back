const { PubSub, withFilter } = require('graphql-subscriptions');
const pubsub = new PubSub();
const mongoose = require('mongoose');
import { Schema } from 'mongoose';

const messages = [];

const Message = mongoose.model('Message', {
  "device":{
  type:String,
  required:true
},
"timestamp":{
  type:Number,
  required:true
},
"data":{
  type:String,
  required:true
} });

const resolvers = {
  Query: {
    getMessages(parentValue, params) {
      const messages = Message.find().exec()
      return messages;
    }
  },
  Mutation: {
    addMessage(parentValue, { device, timestamp, data }) {
      messages.push({ device, timestamp, data });

      const mess = new Message({ device: device, data: data, timestamp: timestamp })
      mess.save().then(() => console.log("message creado"))

      pubsub.publish('newMessageAdded', {
        newMessageAdded: { device, timestamp, data }
      });
      
      return messages;
    }
  },
  Subscription: {
    newMessageAdded: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('newMessageAdded'),
        (params, variables) => true
      )
    }
  }
};

module.exports = {
  resolvers,
  Message
}