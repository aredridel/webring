import { JSDOM } from "jsdom";

export async function verifySite(site: string): Promise<boolean> {
  const base = new URL(process.env.SELF);
  try {
    const dom = await JSDOM.fromURL(site);
    const { window } = dom;

    const links = [];
    for (const el of window.document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
      const link = new URL(el.getAttribute("href")!, site);
      if (link.protocol == base.protocol && link.host == base.host) {
        links.push(link);
      }
    }

    return verify(links);
  } catch (e) {
    console.warn(e);
    return false;
  }

  function verify(links: URL[]) {
    return links.some(nextLink) && links.some(prevLink);
  }

  function nextLink(l: URL) {
    return l.pathname == "/next/" + site;
  }

  function prevLink(l: URL) {
    return l.pathname == "/prev/" + site;
  }
}
