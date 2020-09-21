import { compile } from "handlebars";
import { readFile } from "fs/promises";

export async function render(name: string, data = {}): Promise<string> {
  const template = await readFile(name, { encoding: "utf-8" }).then(compile);
  return template(data);
}
