import { JSDOM, ResourceLoader, type FetchOptions } from "jsdom";

class TimeoutResourceLoader extends ResourceLoader {
  fetch(url: string, options: FetchOptions) {
    const p = super.fetch(url, options);
    if (!p) return p;
    let finished = false;
    p.then(() => (finished = true)).catch(() => {});

    setTimeout(() => {
      if (!finished) p.abort();
    }, 30000);
    return p;
  }
}

const resourceLoader = new TimeoutResourceLoader({
  userAgent: process.env.SELF,
});

export async function verifySite(site: string): Promise<boolean> {
  const base = new URL(process.env.SELF!);
  try {
    const dom = await JSDOM.fromURL(site, {
      userAgent: process.env.SELF,
      resources: resourceLoader,
    });
    const { window } = dom;

    const links = [];
    for (const el of window.document.querySelectorAll<HTMLAnchorElement>(
      "a[href]",
    )) {
      const link = new URL(el.getAttribute("href")!, site);
      if (link.protocol == base.protocol && link.host == base.host) {
        links.push(link);
      }
    }

    window.close();

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
