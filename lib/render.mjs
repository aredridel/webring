import pkg from 'handlebars';
const { compile } = pkg;
import { readFile } from "fs/promises";

export async function render(name, data = {}) {
  const template = await readFile(name, { encoding: "utf-8" }).then(compile);
  return template(data);
}
