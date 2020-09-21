import { fastify } from "fastify";
import formbody from "fastify-formbody";
import favicon from "fastify-favicon";
import { config } from "dotenv";

import routes from "./routes";

config();

const app = fastify({ logger: true });
app.register(formbody);
app.register(favicon);

app.register(routes);


// Run the server!
const start = async () => {
  if (!process.env.SELF) {
    app.log.error("Set SELF environment variable to the URL of this app");
    process.exit(1);
  }
  try {
    await app.listen(Number(process.env.PORT) || 7772, "::");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
