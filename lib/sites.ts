import { verifySite } from "./verify.ts";
import { resolve } from "path";
import { DatabaseSync } from "node:sqlite";

const dir = process.env.DATABASE || ".";

const DB = new DatabaseSync(resolve(dir, "sites.db"));

DB.exec(`
  CREATE TABLE IF NOT EXISTS sites(
    url TEXT PRIMARY KEY,
    pending INT NOT NULL,
    dead TEXT,
    last_verified TEXT
  ) STRICT 
`);

const enqueue_ = DB.prepare("INSERT INTO sites (url, pending) VALUES (?, true)");
export function enqueue(site: string) {
  enqueue_.run(site);
}

const addSite_ = DB.prepare("UPDATE sites SET pending = false WHERE url = ?");
export function addSite(site: string): void {
  addSite_.run(site);
}

const getToVerify = DB.prepare("SELECT url FROM sites WHERE pending = true AND dead IS NULL OR last_verified < DATE('now', '-1 month')");
const markSiteDead = DB.prepare("UPDATE sites SET dead = ? WHERE url = ?");
const updateLastVerified = DB.prepare("UPDATE sites SET last_verified = datetime('now') WHERE url = ?");
export async function verifySites(): Promise<void> {
  const list = getToVerify.all();
  for (const { url } of list) {
    console.warn("Verifying", url);
    if (!(await verifySite(url as string))) {
      console.warn(url, "is dead, moving to dead list");
      markSiteDead.run(new Date().toISOString(), url)
    } else {
      updateLastVerified.run(url);
    }
  }
}

const getNext = DB.prepare("SELECT url FROM sites WHERE pending = false AND dead IS NULL AND rowid > (SELECT rowid FROM sites WHERE url = ?) LIMIT 1");
export function nextSite(site: string): string {
  const next = getNext.get(site);
  if (next) {
    return next.url as string;
  } else {
    return randomSite();
  }
}

const getPrev = DB.prepare("SELECT url FROM sites WHERE pending = false AND dead IS NULL AND rowid < (SELECT rowid FROM sites WHERE url = ?) LIMIT 1");
export function prevSite(site: string): string {
  const prev = getPrev.get(site);
  if (prev) {
    return prev.url as string;
  } else {
    return randomSite();
  }
}

const getRandom = DB.prepare("SELECT url FROM sites WHERE ROWID >= (abs(random()) % (SELECT max(ROWID) FROM sites)) LIMIT 1");
export function randomSite(): string {
  const site = getRandom.get();
  return site!.url as string;
}
