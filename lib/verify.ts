import { JSDOM } from "jsdom";
import url from "url";
import type { Url } from "url";

export async function verifySite(site: string): Promise<boolean> {
  console.warn("Trying ", site);
  const base = url.parse(process.env.SELF);
  try {
    const dom = await JSDOM.fromURL(site);
    const { window } = dom;

    const links = [];
    for (const el of window.document.querySelectorAll("a[href]")) {
      const link = url.parse(el.getAttribute("href"));
      if (link.protocol == base.protocol && link.host == base.host) {
        links.push(link);
      }
    }

    console.warn(links);
    return verify(links);
  } catch (e) {
    console.warn(e);
    return false;
  }

  function verify(links: Array<Url>) {
    return links.some(nextLink) && links.some(prevLink);
  }

  function nextLink(l: Url) {
    return l.path == "/next/" + site;
  }

  function prevLink(l: Url) {
    return l.path == "/prev/" + site;
  }
}
