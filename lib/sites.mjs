import { verifySite } from "./verify.mjs";
import { open } from "fs/promises";
import { resolve } from "path";

const dir = process.env.DATABASE || ".";

export async function enqueue(site) {
  const pending = await open(resolve(dir, "pending.json"), "a+");
  try {
    await appendTo(pending, site);
  } finally {
    await pending.close();
  }
}

async function getList(file) {
  const pending = await open(file, "r");
  try {
    const data = await pending.readFile("utf-8");
    const list = data ? JSON.parse(data) : [];
    return list;
  } finally {
    await pending.close();
  }
}

async function appendTo(fh, line) {
  const data = await fh.readFile("utf-8");
  const list = data ? JSON.parse(data) : [];
  if (!list.includes(line)) list.push(line);
  await fh.truncate();
  await fh.writeFile(JSON.stringify(list, null, 2));
}

async function removeFrom(fh, line) {
  const data = await fh.readFile("utf-8");
  const list = data ? JSON.parse(data) : [];
  const newList = list.filter((e) => e != line);
  await fh.truncate();
  await fh.writeFile(JSON.stringify(newList, null, 2));
}

export async function addSite(site) {
  const pending = await open(resolve(dir, "pending.json"), "a+");
  const sites = await open(resolve(dir, "sites.json"), "a+");
  try {
    await appendTo(sites, site);
    await removeFrom(pending, site);
    const data = await pending.readFile("utf-8");
    const list = data ? JSON.parse(data) : [];
    if (!list.includes(site)) list.push(site);
    await pending.truncate();
    await pending.writeFile(JSON.stringify(list, null, 2));
  } finally {
    await pending.close();
  }
}

export async function verifySites() {
  const list = await getList(resolve(dir, "pending.json"));
  for (const site of list) {
    await verifySite(site);
  }
}

export async function nextSite(site) {
  const list = await getList(resolve(dir, "sites.json"));
  const idx = list.indexOf(site);
  if (idx == -1) {
    return randomSite();
  } else {
    return list[(idx + list.length + 1) % list.length];
  }
}

export async function prevSite(site) {
  const list = await getList(resolve(dir, "sites.json"));
  const idx = list.indexOf(site);
  if (idx == -1) {
    return randomSite();
  } else {
    return list[(idx + list.length - 1) % list.length];
  }
}

export async function randomSite() {
  const list = await getList(resolve(dir, "sites.json"));
  return list[Math.floor(Math.random() * list.length)];
}
