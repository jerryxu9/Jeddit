import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConfig from "./mikro-orm.config";

const main = async () => {
  /* MikroORM setup */
  const orm = await MikroORM.init(microConfig); // connect to the database
  await orm.getMigrator().up(); // runs migrations up to the latest

  //   const posts = await orm.em.find(Post, {});
  //   console.log(posts);
};

main().catch((err) => {
  console.error(err);
});
