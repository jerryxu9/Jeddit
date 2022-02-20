import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  /* MikroORM setup */
  const orm = await MikroORM.init(microConfig); // connect to the database
  await orm.getMigrator().up(); // runs migrations up to the latest

  /* Express setup */
  const app = express();
  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });

  /* Apollo GraphQL Server setup */
  const apolloServer = new ApolloServer({
    /* GraphQL schema setup */
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // context is a special object that's accessible by all the resolvers
    context: () => ({ em: orm.em }),
  });

  await apolloServer.start(); // without this, apollo will throw an error
  apolloServer.applyMiddleware({ app }); // Create a GrahQL enpoint on express

  // just testing:
  //   app.get("/", (req, res) => {
  //     res.send("hi welcome to my app");
  //   });
};

main().catch((err) => {
  console.error(err);
});
