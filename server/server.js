const express = require('express');
// import apolloserver
const { ApolloServer } = require('apollo-server-express');
// import typedefs and resolvers
const { typeDefs, resolvers } = require('./schema');
const db = require('./config/connection');
const { authMiddleware } = require('./utils/auth');
const path = require('path');

const PORT = process.env.PORT || 3001;
const app = express();

const startServer = async() => {
  // create new apollo server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
  });
  // start apollo server
  await server.start();
  // integrate apollo server with express app as middleware
  server.applyMiddleware({ app });
  // log test url
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
};
// init apollo server
startServer();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// serve up static assets
if (process.env.NODE.ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..client/build')));
}

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
  });
});
