import type {
  FastifyInstance,
  FastifyRegisterOptions,
  FastifyPluginOptions,
} from "fastify"
import { verifySite } from "./lib/verify.ts";
import {
  enqueue,
  nextSite,
  prevSite,
  randomSite,
  addSite,
  verifySites,
} from "./lib/sites.ts";
import { render } from "./lib/render.ts";

import JoinRequestSchema from "./schemas/joinrequest.json" with { type: "json" };
import type { JoinRequest as JoinRequestInterface } from "./types/schemas/joinrequest.d.ts";

export default function(
  app: FastifyInstance,
  _opts: FastifyRegisterOptions<FastifyPluginOptions>,
  done: () => void,
): void {
  app.get("/", async (_request, reply) => {
    reply.type("text/html; charset=utf-8");
    reply.send(await render("views/index.hbs"));
  });

  app.get("/join", async (_request, reply) => {
    reply.type("text/html; charset=utf-8");
    reply.send(await render("views/join.hbs"));
  });

  app.post<{ Body: JoinRequestInterface }>(
    "/join",
    { schema: { body: JoinRequestSchema } },
    async (request, reply) => {
      const url = request.body.url;
      enqueue(url);
      reply.type("text/html; charset=utf-8");
      reply.send(
        await render("views/success.hbs", {
          siteURL: url,
          baseURL: process.env.SELF,
        }),
      );
    },
  );

  app.post<{ Body: JoinRequestInterface }>(
    "/confirm",
    { schema: { body: JoinRequestSchema } },
    async (request, reply) => {
      if (await verifySite(request.body.url)) {
        addSite(request.body.url);
        reply.send("The links are good! You're part of the web ring!");
      } else {
        reply.send("Couldn't find the link on your page. Try again?");
      }
    },
  );

  app.post("/verify-all", async (_request, reply) => {
    verifySites();
    reply.code(200).send("");
  });

  type SiteParams = {
    "*": string;
  };

  app.head<{ Params: SiteParams }>("/next/*", async (request, reply) => {
    const site = nextSite(request.params["*"]);
    reply.redirect(site, 307);
  });
  app.get<{ Params: SiteParams }>("/next/*", async (request, reply) => {
    const site = nextSite(request.params["*"]);
    reply.redirect(site, 307);
  });

  app.head<{ Params: SiteParams }>("/prev/*", async (request, reply) => {
    const site = prevSite(request.params["*"]);
    reply.redirect(site, 307);
  });
  app.get<{ Params: SiteParams }>("/prev/*", async (request, reply) => {
    const site = prevSite(request.params["*"]);
    reply.redirect(site, 307);
  });

  app.get("/random", async (_request, reply) => {
    const site = randomSite();
    reply.redirect(site, 307);
  });

  done();
}
