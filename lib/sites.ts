import type {FileHandle} from "fs/promises";
import { verifySite } from "./verify";
import { open } from "fs/promises";
import { resolve } from "path";

const dir = process.env.DATABASE || '.';

export async function enqueue(site: string): Promise<void> {
  const pending: FileHandle = await open(resolve(dir, "pending.json"), "a+");
  try {
    await appendTo(pending, site);
  } finally {
    await pending.close();
  }
}

async function getList(file: string): Promise<Array<string>> {
  const pending = await open(file, "r");
  try {
    const data = await pending.readFile("utf-8");
    const list = data ? JSON.parse(data) : [];
    return list;
  } finally {
    await pending.close();
  }
}

async function appendTo(fh: FileHandle, line: string): Promise<void> {
    const data = await fh.readFile("utf-8");
    const list = data ? JSON.parse(data) : [];
    if (!list.includes(line)) list.push(line);
    await fh.truncate();
    await fh.writeFile(JSON.stringify(list, null, 2));
}

async function removeFrom(fh: FileHandle, line: string): Promise<void> {
  const data = await fh.readFile("utf-8");
  const list: Array<string> = data ? JSON.parse(data) : [];
  const newList = list.filter(e => e != line);
  await fh.truncate();
  await fh.writeFile(JSON.stringify(newList, null, 2));
}

export async function addSite(site: string): Promise<void> {
  const pending: FileHandle = await open(resolve(dir, "pending.json"), "a+");
  const sites: FileHandle = await open(resolve(dir, "sites.json"), "a+");
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

export async function verifySites(): Promise<void> {
  const list = await getList(resolve(dir, "pending.json"));
  for (const site of list) {
    await verifySite(site);
  }
}

export async function nextSite(site: string): Promise<string> {
  const list = await getList(resolve(dir, "sites.json"));
  const idx = list.indexOf(site);
  if (idx == -1) {
    return randomSite();
  } else {
    return list[(idx + 1) % list.length];
  }
}

export async function prevSite(site: string): Promise<string> {
  const list = await getList(resolve(dir, "sites.json"));
  const idx = list.indexOf(site);
  if (idx == -1) { 
    return randomSite();
  } else {
    return list[(idx - 1) % list.length];
  }
}

export async function randomSite(): Promise<string> {
  const list = await getList(resolve(dir, "sites.json"));
  return list[Math.floor(Math.random() * list.length)]
}
