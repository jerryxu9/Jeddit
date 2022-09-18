import { User } from "../entities/User";
import { MyContext } from "src/types";
import argon2 from "argon2";
import {
  Resolver,
  Query,
  InputType,
  Mutation,
  Field,
  Arg,
  Ctx,
  ObjectType,
} from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";

/* using the InputType decorator instead of having multiple
   Arg decorator for 'register' and 'login' 
*/
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  // ? means optional. If there is an error with the query, we can return this
  // errors object to help us debug
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  // Get the current user data
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // if user id not found in session, user is not logged in
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  // User registration
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "Length must be greater than 2",
          },
        ],
      };
    }
    if (options.password.length <= 6) {
      return {
        errors: [
          {
            field: "password",
            message: "Length must be greater than 6",
          },
        ],
      };
    }

    // Use argon2 to hash the password
    const hashedPassword = await argon2.hash(options.password);
    // create and add a new user to the database
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
    });

    // let user;
    try {
      // const result = await (em as EntityManager)
      //   .createQueryBuilder(User)
      //   .getKnexQuery()
      //   .insert({
      //     username: options.username,
      //     password: hashedPassword,
      //     created_at: new Date(), // need to add this ourselves b/c using Knex instaed of Micro-ORM
      //     updated_at: new Date(), // need to add this ourselves b/c using Knex instaed of Micro-ORM
      //   })
      //   .returning("*");
      // user = result[0];
      await em.persistAndFlush(user);
    } catch (err) {
      // duplicate username error
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            },
          ],
        };
      }
    }

    // store user id session. This will set a cookie on the user
    req.session.userId = user.id;
    return { user };
  }

  // User login
  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    // If user not found, return error
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "Username Does Not Exist",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);
    // If password not valid, return error
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password",
          },
        ],
      };
    }
    // we can store any data inside the session. We store the user id to tell who the user is
    req.session.userId = user.id;
    // console.log("session: ", req.session);

    // Successfully logged in. Return user
    return {
      user,
    };
  }

  // User logout
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      // remove the session in Redis and clear the cookie
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
