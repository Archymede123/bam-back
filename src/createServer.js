const { GraphQLServer, PubSub } = require('graphql-yoga');
const Mutation = require('./resolvers/Mutation');
const Query = require('./resolvers/Query');
const Subscription = require('./resolvers/Subscription')
const db = require('./db');
const getTracks = require('./getTracks')
const pubsub = new PubSub()

// Create the GraphQL Yoga Server


function createServer() {
  const server = new GraphQLServer({
    typeDefs: 'src/schema.graphql',
    resolvers: {
      Mutation,
      Query,
      Subscription
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
    context: req => ({ ...req, pubsub, db }),
  });
  
  return server
}

getTracks(db)


module.exports = createServer;