#!/usr/bin/env node
// Moves src/content/posts/<tistoryId>/ to src/content/posts/<cat>/<sub>/<slug>/
// and rewrites internal links /posts/<id>[/][#anchor|?query] to the new URL.
// Driven by scripts/post-slugs.json. Safe to re-run: already-moved posts are skipped.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const postsDir = path.join(root, 'src/content/posts');
const entries = JSON.parse(fs.readFileSync(path.join(root, 'scripts/post-slugs.json'), 'utf8'));
const byId = new Map(entries.map((e) => [String(e.tistoryId), e]));

// 1. Move folders
let moved = 0, skipped = 0;
for (const e of entries) {
  const rel = e.url.replace(/^\/|\/$/g, '');
  const from = path.join(postsDir, String(e.tistoryId));
  const to = path.join(postsDir, ...rel.split('/'));
  if (fs.existsSync(path.join(to, 'index.md'))) {
    if (fs.existsSync(from)) throw new Error(`Both ${from} and ${to} exist; resolve manually`);
    skipped++;
    continue;
  }
  if (!fs.existsSync(from)) throw new Error(`Missing source folder for ${e.tistoryId}: ${from}`);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
  moved++;
}

// 2. Rewrite internal links in every markdown file under posts
function* walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(p);
    else if (/\.mdx?$/.test(d.name)) yield p;
  }
}
const linkRe = /\/posts\/(\d+)(?:\/)?(?=[#?)"'\s>\]]|$)/g;
let filesChanged = 0, linksRewritten = 0;
const unknown = new Set();
for (const file of walk(postsDir)) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.replace(linkRe, (m, id) => {
    const e = byId.get(id);
    if (!e) { unknown.add(id); return m; }
    linksRewritten++;
    return e.url;
  });
  if (out !== src) { fs.writeFileSync(file, out); filesChanged++; }
}

console.log(`moved ${moved}, already moved ${skipped}; rewrote ${linksRewritten} links in ${filesChanged} files`);
if (unknown.size) console.warn(`unknown post ids referenced: ${[...unknown].join(', ')}`);
