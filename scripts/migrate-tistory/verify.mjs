// Renders every converted post with micromark+GFM and flags common conversion defects.
import fs from 'node:fs'; import path from 'node:path';
import { micromark } from 'micromark'; import { gfm, gfmHtml } from 'micromark-extension-gfm';
const OUT = path.resolve(import.meta.dirname, '../../src/content/posts');
const issues = {};
for (const id of fs.readdirSync(OUT)) {
  const md = fs.readFileSync(path.join(OUT, id, 'index.md'), 'utf8');
  const body = md.replace(/^---[\s\S]*?\n---\n/, '');
  const html = micromark(body, { allowDangerousHtml: true, extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  const text = html.replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<code>[\s\S]*?<\/code>/g, '').replace(/<[^>]+>/g, '');
  const add = (k, v) => ((issues[id] ||= []).push(k + (v ? ': ' + v : '')));
  for (const m of text.matchAll(/.{0,30}(\*\*|__).{0,30}/g)) add('literal **', m[0].replace(/\n/g, ' '));
  for (const m of text.matchAll(/.{0,30}\|\s*---.{0,10}/g)) add('broken table', m[0]);
  for (const m of body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) if (!/^https?:/.test(m[1]) && !fs.existsSync(path.join(OUT, id, m[1]))) add('missing image', m[1]);
  const fences = (body.match(/^(```|~~~~)/gm) || []).length; if (fences % 2) add('odd fences');
  for (const m of body.matchAll(/^```\s*$/gm)) {} // closing fences
  const nolang = body.split('\n').filter((l, i, a) => /^```$/.test(l)).length; // count bare fences
}
console.log(JSON.stringify(issues, null, 1));

// text fidelity: tokens of the original body that are missing from the rendered markdown
import * as cheerio from 'cheerio';
const rows = [];
for (const id of fs.readdirSync(OUT)) {
  const raw = fs.readFileSync(path.join(import.meta.dirname, 'cache/html', id + '.html'), 'utf8');
  const s = raw.indexOf('>', raw.indexOf('<div class="tt_article_useless_p_margin')) + 1;
  const e = raw.lastIndexOf('<!-- System - START -->', raw.lastIndexOf('container_postbtn'));
  const $ = cheerio.load(raw.slice(s, e), null, false);
  $('style,script,link,meta,title,head,details.note-toc,nav.toc-box,nav.nav,div.note-code-label').remove();
  $('[data-ke-type="opengraph"] .og-image').remove();
  $('p,div,li,td,th,h1,h2,h3,h4,br,figcaption,summary,pre,tr').each((_, x) => { $(x).append(' '); $(x).prepend(' '); });
  const orig = $.root().text();
  const md = fs.readFileSync(path.join(OUT, id, 'index.md'), 'utf8').replace(/^---[\s\S]*?\n---\n/, '');
  const html = micromark(md, { allowDangerousHtml: true, extensions: [gfm()], htmlExtensions: [gfmHtml()] });
  const $o = cheerio.load(html); $o('p,div,li,td,th,h1,h2,h3,h4,br,figcaption,summary,pre,tr').each((_, x) => { $o(x).append(' '); $o(x).prepend(' '); });
  const out = $o.root().text();
  const tok = (t) => t.match(/[\p{L}\p{N}]+/gu) || [];
  const bag = new Map(); for (const t of tok(out)) bag.set(t, (bag.get(t) || 0) + 1);
  const missing = []; const ot = tok(orig);
  for (const t of ot) { const c = bag.get(t) || 0; if (c) bag.set(t, c - 1); else missing.push(t); }
  rows.push([id, ot.length, missing.length, missing.slice(0, 12).join(' ')]);
}
rows.sort((a, b) => b[2] / b[1] - a[2] / a[1]);
for (const r of rows.slice(0, 15)) console.log(r.join(' | '));
