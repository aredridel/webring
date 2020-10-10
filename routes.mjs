import { verifySite } from "./lib/verify.mjs";
import { enqueue, nextSite, prevSite, randomSite, addSite } from "./lib/sites.mjs";
import { render } from "./lib/render.mjs";
import { readFileSync } from "fs";

const JoinRequestSchema = JSON.parse(readFileSync('schemas/joinrequest.json', 'utf-8'));

export default function(
  app,
  _opts,
  done
){
  app.get("/", async (_request, reply) => {
    reply.type("text/html; charset=utf-8");
    reply.send(await render("views/index.hbs"));
  });

  app.get("/join", async (_request, reply) => {
    reply.type("text/html; charset=utf-8");
    reply.send(await render("views/join.hbs"));
  });

  app.post(
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

  app.post(
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

  app.head("/next/*", async (request, reply) => {
    const site = await nextSite(request.params["*"]);
    reply.redirect(307, site);
  });
  app.get("/next/*", async (request, reply) => {
    const site = await nextSite(request.params["*"]);
    reply.redirect(307, site);
  });

  app.head("/prev/*", async (request, reply) => {
    const site = await prevSite(request.params["*"]);
    reply.redirect(307, site);
  });
  app.get("/prev/*", async (request, reply) => {
    const site = await prevSite(request.params["*"]);
    reply.redirect(307, site);
  });

  app.get("/random", async (_request, reply) => {
    const site = await randomSite();
    reply.redirect(307, site);
  });

  done();
}
