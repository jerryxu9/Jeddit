import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
// import * as redis from "redis";
// import connectRedis from "connect-redis";
// import session from "express-session";
// import Redis from "ioredis";
import { MyContext } from "./types";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import cors from "cors";

const session = require("express-session");
let RedisStore = require("connect-redis")(session);

const main = async () => {
  /* MikroORM setup */
  const orm = await MikroORM.init(microConfig); // connect to the database
  await orm.getMigrator().up(); // runs migrations up to the latest

  /* Express setup */
  const app = express();

  // app.set("trust proxy", !process.env.NODE_ENV === "production");
  // app.set("Access-Control-Allow-Origin", "https://studio.apollographql.com");
  // app.set("Access-Control-Allow-Credentials", true);

  /* Redis with connect-redis middleware */
  // This middleware needs to come before apollo middleware b/c we want to use session inside apollo
  // Type issue: https://stackoverflow.com/questions/65980722/how-to-set-connect-redis-in-typescript
  // const RedisStore = connectRedis(session);
  // const redisClient = redis.createClient();

  // ioredis
  // const Redis = require("ioredis");
  // let redisClient = new Redis();
  // const redis = require("redis");
  // const session = require("express-session");

  // const RedisStore = connectRedis(session);
  // let redisClient = redis.createClient();

  // DONT FORGET TO START REDIS FIRST!!!! ;-;
  const { createClient } = require("redis");
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  app.use(
    cors({
      origin: "http://localhost:3000", // frontend port
      credentials: true, // accept credentials
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redisClient,
        // client: redisClient as any,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true, // frontend javascript code won't be able to access the cookie to improve security
        sameSite: "lax", // protect csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
    })
  );

  /* Apollo GraphQL Server setup */
  const apolloServer = new ApolloServer({
    /* GraphQL schema setup */
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    // context is a special object that's accessible by all the resolvers
    context: ({ req, res }) => ({ em: orm.em, req, res }),
    plugins: [
      ApolloServerPluginLandingPageGraphQLPlayground({
        // options
      }),
    ],
  });

  await apolloServer.start(); // without this, apollo will throw an error
  apolloServer.applyMiddleware({
    app,
    cors: false,
  }); // Create a GrahQL enpoint on express

  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });
};

main().catch((err) => {
  console.error(err);
});
