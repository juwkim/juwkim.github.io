// Step 1: download sitemap + every post HTML into ./cache/html/<id>.html (skips existing).
import fs from 'node:fs/promises';
import path from 'node:path';
const BLOG = 'https://juwkim.tistory.com';
const dir = path.join(import.meta.dirname, 'cache', 'html');
await fs.mkdir(dir, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sm = await (await fetch(`${BLOG}/sitemap.xml`)).text();
const ids = [...new Set([...sm.matchAll(/<loc>https:\/\/juwkim\.tistory\.com\/(?:m\/)?(\d+)<\/loc>/g)].map((m) => +m[1]))].sort((a, b) => a - b);
console.log('posts in sitemap:', ids.length);
await fs.writeFile(path.join(import.meta.dirname, 'cache', 'ids.json'), JSON.stringify(ids));
for (const id of ids) {
  const f = path.join(dir, `${id}.html`);
  try { await fs.access(f); continue; } catch {}
  const res = await fetch(`${BLOG}/${id}`, { headers: { 'User-Agent': 'Mozilla/5.0 (blog-migration)' } });
  if (!res.ok) { console.log('FAIL', id, res.status); continue; }
  await fs.writeFile(f, await res.text());
  console.log('ok', id);
  await sleep(400);
}
