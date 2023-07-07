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


const app = express();
const PORT = process.env.PORT || 3001;
//setting up Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
})

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

//app.use(routes);

const startApolloServer = async () => {
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