import type {FileHandle} from "fs/promises";
import { verifySite } from "./verify";
import { open } from "fs/promises";
import { resolve } from "path";

const dir = process.env.DATABASE || '.';
const PENDING = resolve(dir, "pending.json");
const SITES = resolve(dir, "sites.json");

const waiting: Record<string, Promise<unknown>> = {};
async function waitFor<T>(key: string, task: () => Promise<T>): Promise<T> {
  const prev = waiting[key];
  let finish;
  waiting[key] = new Promise((accept) => {
    finish = accept;
  });
  let ret: T;
  try {
    await prev;
    ret = await task();
  } finally {
    finish!();
  }
  return ret;
}


export async function enqueue(site: string): Promise<void> {
  return waitFor(PENDING, async () => {
    const pending: FileHandle = await open(PENDING, "a+");
    try {
      await appendTo(pending, site);
    } finally {
      await pending.close();
    }
  });
}

async function getList(file: string): Promise<Array<string>> {
  return waitFor(file, async () => {
    const pending = await open(file, "r");
    try {
      const data = await pending.readFile("utf-8");
      const list = data ? JSON.parse(data) : [];
      return list;
    } catch (e) {
      throw Object.assign(new Error(`error reading '${file}'`), {cause: e});
    } finally {
      await pending.close();
    }
  });
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
  return waitFor(PENDING, async () => {
    return waitFor(SITES, async () => {
      const pending: FileHandle = await open(PENDING, "a+");
      const sites: FileHandle = await open(SITES, "a+");
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
    });
  });
}

export async function verifySites(): Promise<void> {
  const list = await getList(PENDING);
  for (const site of list) {
    await verifySite(site);
  }
}

export async function nextSite(site: string): Promise<string> {
  const list = await getList(SITES);
  const idx = list.indexOf(site);
  if (idx == -1) {
    return randomSite();
  } else {
    return list[(idx + list.length + 1) % list.length];
  }
}

export async function prevSite(site: string): Promise<string> {
  const list = await getList(SITES);
  const idx = list.indexOf(site);
  if (idx == -1) { 
    return randomSite();
  } else {
    return list[(idx + list.length - 1) % list.length];
  }
}

export async function randomSite(): Promise<string> {
  const list = await getList(SITES);
  return list[Math.floor(Math.random() * list.length)]
}
