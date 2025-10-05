import { XMLParser } from "fast-xml-parser";

export async function fetchRSS(rssUrl) {
  const res = await fetch(rssUrl);
  const xml = await res.text();
  const parser = new XMLParser();
  const jsonObj = parser.parse(xml);

  return jsonObj.rss.channel.item.map(item => ({
    title: item.title,
    link: item.link,
    description: item.description,
  }));
}