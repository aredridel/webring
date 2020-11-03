import {
  FastifyInstance,
  FastifyRegisterOptions,
  FastifyPluginOptions,
} from "fastify";
import { verifySite } from "./lib/verify";
import { enqueue, nextSite, prevSite, randomSite, addSite } from "./lib/sites";
import { render } from "./lib/render";

import JoinRequestSchema from "./schemas/joinrequest.json";
import { JoinRequest as JoinRequestInterface } from "./types/schemas/joinrequest";

export default function(
  app: FastifyInstance,
  _opts: FastifyRegisterOptions<FastifyPluginOptions>,
  done: () => void
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
      await enqueue(url);
      reply.type("text/html; charset=utf-8");
      reply.send(
        await render("views/success.hbs", {
          siteURL: url,
          baseURL: process.env.SELF,
        })
      );
    }
  );

  app.post<{ Body: JoinRequestInterface }>(
    "/confirm",
    { schema: { body: { JoinRequestSchema } } },
    async (request, reply) => {
      if (await verifySite(request.body.url)) {
        await addSite(request.body.url);
        reply.send("The links are good! You're part of the web ring!");
      } else {
        reply.send("Couldn't find the link on your page. Try again?");
      }
    }
  );

  type SiteParams = {
    "*": string
  };

  app.head<{Params: SiteParams}>("/next/*", async (request, reply) => {
    const site = await nextSite(request.params["*"]);
    reply.redirect(307, site);
  });
  app.get<{Params: SiteParams}>("/next/*", async (request, reply) => {
    const site = await nextSite(request.params["*"]);
    reply.redirect(307, site);
  });

  app.head<{Params: SiteParams}>("/prev/*", async (request, reply) => {
    const site = await prevSite(request.params["*"]);
    reply.redirect(307, site);
  });
  app.get<{Params: SiteParams}>("/prev/*", async (request, reply) => {
    const site = await prevSite(request.params["*"]);
    reply.redirect(307, site);
  });

  app.get("/random", async (_request, reply) => {
    const site = await randomSite();
    reply.redirect(307, site);
  });

  done();
}
