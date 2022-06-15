import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";
import { Request, Response, Express } from "express";
import { Session, SessionData } from "express-session";

export type MyContext = {
  em: EntityManager<IDatabaseDriver<Connection>>;
  req: Request & {
    // Fixed type issue: https://forum.freecodecamp.org/t/ts-namespace-global-express-has-no-exported-member-session/436838/11
    session: Session & Partial<SessionData> & { userId: number };
  };
  res: Response;
};
