const express = require('express');
const path = require('path');
//Added required packages for Apollo Server
const { ApolloServer } = require ('apollo-server-express')
const db = require('./config/connection');
//Importing authMiddleware for use with context
const { authMiddleware } = require('./utils/auth')
//commented out routes for now
//const routes = require('./routes');
// importing resolvers and typedefs
const { typeDefs, resolvers } = require('./schemas')

const PORT = process.env.PORT || 3001;
const app = express();
//setting up Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // modified context to ensure user is being added
  context: ({ req }) => {
    const { user } = authMiddleware({ req });
    return { user };
  },
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//app.use(routes);

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };

  startApolloServer(typeDefs, resolvers);