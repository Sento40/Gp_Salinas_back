/* eslint-disable max-len */
const {makeExecutableSchema} = require('graphql-tools');
const {resolvers} = require('./resolvers');

const typeDefs = `
  type Message {
    device: String!
    timestamp: String!
    data: String!
  }

  type Query {
    getMessages: [Message]
  }

  type Mutation {
    addMessage(device: String!, timestamp: String!, data: String!): [Message]
  }

  type Subscription {
    newMessageAdded: Message
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;

module.exports = makeExecutableSchema({typeDefs, resolvers});
