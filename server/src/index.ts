import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";
import express from "express";

const main = async () => {
  /* MikroORM setup */
  const orm = await MikroORM.init(microConfig); // connect to the database
  await orm.getMigrator().up(); // runs migrations up to the latest

  /* Express setup */
  const app = express();
  app.listen(4000, () => {
    console.log("server started on localhost:4000");
  });

  // just testing:
  app.get("/", (req, res) => {
    res.send("hi welcome to my app");
  });
};

main().catch((err) => {
  console.error(err);
});
