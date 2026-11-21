// Step 2: convert cached Tistory HTML (./cache/html/<id>.html, produced by fetch.mjs)
// into src/content/posts/<id>/index.md + downloaded images.
// Usage: node convert.mjs [id ...]   (no ids = all posts)
import fs from 'node:fs/promises';
import fss from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const HERE = import.meta.dirname;
const CACHE = path.join(HERE, 'cache');
const OUT = path.resolve(HERE, '../../src/content/posts');
const IMG_CACHE = path.join(CACHE, 'img');
await fs.mkdir(IMG_CACHE, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const KNOWN_CATEGORIES = ['Computer Science', 'Standard Library', '일상'];

const report = { posts: 0, images: 0, imageFailed: [], problems: [], rawTables: [], categories: {} };
const problem = (id, msg) => report.problems.push(`${id}: ${msg}`);

// ---------------------------------------------------------------- images
function unwrapImageUrl(u) {
  if (!u) return u;
  u = u.trim();
  if (u.startsWith('//')) u = 'https:' + u;
  try {
    const url = new URL(u);
    if (/daumcdn\.net$/.test(url.hostname) && url.pathname.includes('/thumb/') && url.searchParams.get('fname')) {
      return unwrapImageUrl(url.searchParams.get('fname'));
    }
  } catch {}
  return u;
}
const EXT = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/bmp': 'bmp', 'image/avif': 'avif' };
async function downloadImage(url) {
  // cached by url hash so re-runs don't re-download (kakao urls are signed & expire)
  const key = crypto.createHash('sha1').update(url).digest('hex');
  const hit = fss.readdirSync(IMG_CACHE).find((f) => f.startsWith(key + '.'));
  if (hit) return path.join(IMG_CACHE, hit);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (blog-migration)', Referer: 'https://juwkim.tistory.com/' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const ct = (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      let ext = EXT[ct];
      if (!ext) { const m = new URL(url).pathname.match(/\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i); ext = m ? m[1].toLowerCase().replace('jpeg', 'jpg') : null; }
      if (!ext) throw new Error('not an image: ' + ct);
      const buf = Buffer.from(await res.arrayBuffer());
      const f = path.join(IMG_CACHE, `${key}.${ext}`);
      await fs.writeFile(f, buf);
      await sleep(150);
      return f;
    } catch (e) {
      if (attempt === 2) throw e;
      await sleep(1000 * (attempt + 1));
    }
  }
}

// ---------------------------------------------------------------- parsing
function extract(raw) {
  const $doc = cheerio.load(raw);
  const meta = (p) => $doc(`meta[property="${p}"]`).attr('content');
  const tiaraSrc = $doc('script').toArray().map((s) => $doc(s).text()).find((t) => t.includes('window.tiara ='));
  const tiara = JSON.parse(tiaraSrc.match(/window\.tiara = (\{.*\})/)[1]);
  // The post body sits between the content div and the post-button block. Slicing the raw
  // string is more robust than DOM selection because some posts contain a whole pasted
  // <html> document with unbalanced tags.
  const s = raw.indexOf('>', raw.indexOf('<div class="tt_article_useless_p_margin')) + 1;
  const e = raw.lastIndexOf('<!-- System - START -->', raw.lastIndexOf('container_postbtn'));
  if (s <= 0 || e <= s) throw new Error('content boundaries not found');
  return {
    title: meta('og:title') || tiara.entry.entryTitle,
    date: meta('article:published_time'),
    categoryName: tiara.entry.categoryName || '',
    tags: tiara.entry.tags || [],
    body: raw.slice(s, e).replace(/\s*<\/div>\s*$/, ''),
  };
}

const LANG_ALIASES = { py: 'python', python3: 'python', js: 'javascript', ts: 'typescript', sh: 'bash', shell: 'bash', 'c++': 'cpp', cs: 'csharp', 'c#': 'csharp', plaintext: 'text', output: 'text', console: 'text', mysql: 'sql', plsql: 'sql' };
const KNOWN_LANGS = new Set(['python', 'javascript', 'typescript', 'bash', 'cpp', 'c', 'java', 'csharp', 'sql', 'text', 'json', 'html', 'css', 'xml', 'yaml', 'go', 'rust', 'kotlin', 'r', 'markdown', 'powershell', 'ruby', 'php', 'swift']);
function normLang(l) {
  if (!l) return '';
  l = l.toLowerCase().trim();
  l = LANG_ALIASES[l] || l;
  return KNOWN_LANGS.has(l) ? l : '';
}

// placeholders survive turndown escaping and get restored afterwards
function makePlaceholders() {
  const store = [];
  return {
    put: (s) => `\u0001PH${store.push(s) - 1}\u0002`,
    restore: (md) => md.replace(/\u0001PH(\d+)\u0002/g, (_, i) => store[+i]),
  };
}

const CALLOUT_SEL = [
  'div.note-callout', 'div.box', 'div.callout-box', 'div.trap-box', 'div.point', 'div.check', 'div.clue',
  'div.review', 'div.sources', 'div.flow', 'div.narrow', 'div.note-intro-box',
].join(',');
const LABEL_SEL = 'p.note-callout-label, p.box-title, p.trap-title';

function cleanBody(id, html, ph) {
  const $ = cheerio.load(html, null, false);

  // chrome / non-content
  $('style, script, link, meta, title, head, noscript, ins.adsbygoogle, .revenue_unit_wrap, .another_category, .container_postbtn').remove();
  $('details.note-toc, nav.toc-box, nav.nav').remove(); // in-page TOCs: anchors won't survive conversion
  $('div.note-divider').remove(); // invisible spacer
  $('span[class^="token"], span[class*=" token"]').each((_, e) => { $(e).replaceWith($(e).text()); });

  // math (data-math holds the TeX source)
  $('[data-math]').each((_, e) => {
    const tex = $(e).attr('data-math');
    const block = e.tagName === 'div' || /^\s*\$\$/.test($(e).text());
    $(e).replaceWith(block ? `<p>${ph.put(`$$\n${tex}\n$$`)}</p>` : ph.put(`$${tex}$`));
  });

  // Tistory "더보기" (moreless) folding blocks
  $('[data-ke-type="moreLess"]').each((_, e) => {
    const summary = $(e).attr('data-text-more') || '더보기';
    const content = $(e).find('.moreless-content').first();
    $(e).replaceWith(`<details><summary>${summary}</summary>${(content.length ? content : $(e)).html()}</details>`);
  });

  // iframes / embeds -> raw HTML
  $('iframe, video, embed').each((_, e) => {
    const a = e.attribs;
    const attrs = ['src', 'width', 'height', 'title', 'allow', 'allowfullscreen', 'frameborder']
      .filter((k) => a[k] !== undefined).map((k) => (a[k] === '' ? k : `${k}="${a[k]}"`)).join(' ');
    const tag = e.tagName;
    $(e).closest('figure').length ? $(e).closest('figure').replaceWith(`<p>${ph.put(`<${tag} ${attrs}></${tag}>`)}</p>`)
      : $(e).replaceWith(`<p>${ph.put(`<${tag} ${attrs}></${tag}>`)}</p>`);
  });

  // opengraph link cards
  $('figure[data-ke-type="opengraph"]').each((_, e) => {
    const f = $(e);
    const url = f.attr('data-og-url') || f.find('a').attr('href');
    const title = (f.attr('data-og-title') || f.find('.og-title').text() || url).trim();
    const desc = (f.attr('data-og-description') || '').trim();
    const host = (f.attr('data-og-host') || '').trim();
    const esc = (s) => $('<i>').text(s).html();
    f.replaceWith(`<blockquote><p><strong><a href="${esc(url)}">${esc(title)}</a></strong>${desc ? `<br>${esc(desc)}` : ''}${host ? `<br>${esc(host)}` : ''}</p></blockquote>`);
  });

  // repair figures the Tistory editor split apart around inline <b>:
  // <figure><img><figcaption>A</figcaption></figure><b>B</b><figure><figcaption>C</figcaption>…</figure>
  $('figure').each((_, e) => {
    const f = $(e);
    if (!f.find('img').length) return;
    let n = e.nextSibling; const between = [];
    while (n && !(n.type === 'tag' && n.tagName === 'figure')) {
      if (n.type === 'tag' && !['b', 'strong', 'em', 'i', 'span', 'a', 'code', 'br'].includes(n.tagName)) return;
      between.push(n); n = n.nextSibling;
    }
    if (!n || $(n).find('img').length || !$(n).children().first().is('figcaption')) return;
    const cap1 = f.find('figcaption').first(); const next = $(n);
    const cap2 = next.children('figcaption').first();
    // the editor dropped the space before the split-out <b>; restore it
    const mid = ' ' + between.filter((x) => x.type !== 'text' || x.data.trim()).map((x) => $.html(x)).join('');
    if (cap1.length) cap1.append(mid + cap2.html()); else f.append(`<figcaption>${mid}${cap2.html()}</figcaption>`);
    cap2.remove();
    f.append(next.contents());
    between.forEach((x) => $(x).remove());
    next.remove();
  });

  // figures -> images + caption paragraph
  $('figure').each((_, e) => {
    const f = $(e);
    const imgs = f.find('img').toArray();
    const titleEl = f.find('.artifact-title, .photo-title').first();
    const title = titleEl.text().trim(); titleEl.remove();
    const credits = f.find('.credit').toArray().map((c) => { $(c).find('br').replaceWith(' · '); const h = $(c).html().trim(); $(c).remove(); return h; });
    const capEl = f.find('figcaption');
    capEl.find('br').replaceWith(' · ');
    capEl.find('div, p').each((_, d) => { $(d).replaceWith(' ' + $(d).html() + ' '); });
    const cap = capEl.toArray().map((c) => $(c).html().trim()).filter(Boolean).join(' ');
    // anything else left inside the figure that isn't an image / caption
    capEl.remove(); f.find('img').remove();
    const rest = f.text().trim() ? f.html().trim() : '';
    const parts = [];
    for (const img of imgs) parts.push(`<p>${$.html(img)}</p>`);
    if (rest) parts.push(`<p>${rest}</p>`);
    const capHtml = [cap, ...credits].filter(Boolean).join(' · ').replace(/\s+/g, ' ').trim();
    const hasCap = !!capHtml.replace(/<[^>]+>/g, '').trim();
    if (title || hasCap) parts.push(`<p>${title ? `<strong>${title}</strong>` : ''}${title && hasCap ? ' — ' : ''}${hasCap ? `<em>${capHtml}</em>` : ''}</p>`);
    f.replaceWith(parts.join(''));
  });
  $('.photo-title, .artifact-title').each((_, e) => { $(e).replaceWith(`<strong>${$(e).html()}</strong>`); });
  $('.credit').each((_, e) => { $(e).find('br').replaceWith(' · '); $(e).replaceWith(`<p><em>${$(e).html()}</em></p>`); });

  // code blocks
  $('div.note-code-label').remove();
  $('div.code-block-wrap').each((_, e) => {
    const w = $(e);
    const spans = w.find('.code-header span').toArray().map((x) => $(x).text().trim()).filter(Boolean);
    const header = spans.length ? spans[0] + (spans[1] ? ` (${spans.slice(1).join(', ')})` : '') : w.find('.code-header').text().trim();
    w.find('.code-header').remove();
    const lang = normLang(header.split(/\s|—|-/)[0]);
    w.find('pre').attr('data-lang', lang);
    w.replaceWith((header ? `<p><em>${header}</em></p>` : '') + w.html());
  });
  $('div.output-block-wrap').each((_, e) => {
    const w = $(e);
    const header = w.find('.output-header').text().trim();
    w.find('.output-header').remove();
    w.replaceWith((header ? `<p><em>${header}</em></p>` : '') + w.find('.output-body').html());
  });
  $('pre').each((_, e) => {
    const pre = $(e); const code = pre.find('code').first();
    const classes = [pre.attr('class') || '', code.attr('class') || ''].join(' ');
    let lang = pre.attr('data-lang') || '';
    const m = classes.match(/(?:language|lang)-([\w+#-]+)/);
    if (!lang && m) lang = normLang(m[1]);
    if (!lang) for (const c of classes.split(/\s+/)) if (normLang(c)) { lang = normLang(c); break; }
    if (!lang && /note-output-block/.test(classes)) lang = 'text';
    if (!lang && pre.attr('data-ke-language')) lang = normLang(pre.attr('data-ke-language'));
    pre.find('br').replaceWith('\n');
    const text = (code.length ? code : pre).text();
    const fence = text.includes('```') ? '~~~~' : '```';
    pre.replaceWith(`<p>${ph.put(`${fence}${lang}\n${text.replace(/\n+$/, '')}\n${fence}`)}</p>`);
  });

  // reference sections (grid rows) -> lists
  $('div.note-reference-row, div.note-reference-doc-row, div.note-reference-exercise-row').each((_, e) => {
    const r = $(e);
    const label = r.find('.note-reference-label').first().text().trim();
    r.find('.note-reference-label').remove();
    const entries = r.find('.note-reference-entry').toArray();
    const fmt = (el) => {
      const x = $(el);
      x.find('.note-reference-description').each((_, d) => { $(d).replaceWith(` — ${$(d).html().trim()}`); });
      x.find('.note-reference-link-item').each((i, d) => { $(d).replaceWith(`${i ? ' · ' : ' '}${$(d).html().trim()} `); });
      x.find('div, p').each((_, d) => { $(d).replaceWith(` ${$(d).html()} `); });
      return x.html().replace(/\s+/g, ' ').trim();
    };
    const body = entries.length ? entries.map(fmt).join('<br>') : fmt(r.find('.note-reference-content').first().length ? r.find('.note-reference-content').first() : r);
    r.replaceWith(`<li>${label ? `<strong>${label}</strong>: ` : ''}${body.replace(/^ — /, '')}</li>`);
  });
  // wrap consecutive <li> produced above into <ul>
  $('li').each((_, e) => {
    if (e.parent && ['ul', 'ol'].includes(e.parent.tagName)) return;
    const run = [e]; let n = e.nextSibling;
    while (n && (n.type === 'text' && !n.data.trim() || n.type === 'tag' && n.tagName === 'li' && !['ul', 'ol'].includes(n.parent?.tagName))) { run.push(n); n = n.nextSibling; }
    const lis = run.filter((x) => x.type === 'tag');
    $(e).before('<ul class="__refs"></ul>');
    const ul = $(e).prev();
    lis.forEach((li) => ul.append(li));
  });

  // callout boxes -> blockquotes
  $(LABEL_SEL).each((_, e) => { $(e).replaceWith(`<p><strong>${$(e).text().trim()}</strong></p>`); });
  $('p.trap-desc').removeAttr('class');
  // innermost first, so nested boxes become nested quotes cleanly
  $(CALLOUT_SEL).toArray().reverse().forEach((e) => {
    const b = $(e);
    // loose inline content (e.g. div.flow / div.point) needs a paragraph wrapper
    const hasBlock = b.children('p, ul, ol, blockquote, table, h2, h3, h4, div').length;
    b.replaceWith(`<blockquote>${hasBlock ? b.html() : `<p>${b.html().trim()}</p>`}</blockquote>`);
  });
  $('blockquote > blockquote:only-child').each((_, e) => { $(e).parent().replaceWith($.html(e)); });

  // tables
  $('table').each((_, e) => {
    const t = $(e);
    t.find('colgroup, col').remove();
    t.find('.cell-sub').each((_, s) => { $(s).replaceWith($(s).html()); });
    if (t.find('[rowspan], [colspan]').length) {
      // GFM can't express merged cells: keep a cleaned raw HTML table
      t.find('*').each((_, x) => { for (const a of Object.keys(x.attribs)) if (!['rowspan', 'colspan', 'href'].includes(a)) $(x).removeAttr(a); });
      for (const a of Object.keys(e.attribs)) t.removeAttr(a);
      const html = $.html(t).replace(/\n\s*\n/g, '\n');
      report.rawTables.push(id);
      t.replaceWith(`<p>${ph.put(html)}</p>`);
      return;
    }
    if (!t.find('thead').length) {
      const first = t.find('tr').first();
      first.find('td').each((_, c) => { c.tagName = 'th'; });
      t.prepend($('<thead>').append(first));
    }
    t.find('th, td').each((_, c) => {
      const cell = $(c);
      cell.find('br').replaceWith(ph.put('<br>'));
      cell.find('p, div').each((_, d) => { $(d).replaceWith($(d).html() + ' '); });
      // pipes in cells must be escaped for GFM
      cell.find('*').addBack().contents().each((_, n) => { if (n.type === 'text') n.data = n.data.replace(/\|/g, '\u0003'); });
    });
  });

  // unwrap layout containers
  $('div.table-wrap, div.note-table-wrap, div.blog-table-wrap, div.table-pair, div.gallery, div.note-intro, div.note-root, section, article, div.image-container, div.output-body').each((_, e) => { $(e).replaceWith($(e).html()); });

  // images: real url
  $('img').each((_, e) => {
    const img = $(e);
    const span = img.parent('span[data-url]');
    const src = unwrapImageUrl(span.attr('data-url') || img.attr('data-src') || img.attr('src'));
    const alt = (img.attr('alt') || span.attr('data-alt') || '').trim();
    img.replaceWith(`<img src="${$('<i>').text(src).html()}" alt="${$('<i>').text(alt).html()}">`);
    if (span.length) span.replaceWith(span.html());
  });

  // empty paragraphs / headings
  // whitespace-only inline spans (e.g. <span>&nbsp;</span>) carry a meaningful space
  $('span').each((_, e) => {
    const x = $(e);
    if (!x.children().length && x.text() && !x.text().replace(/[\s ​]/g, '')) x.replaceWith(' ');
  });
  $('p, h1, h2, h3, h4, h5, h6, div').each((_, e) => {
    const x = $(e);
    if (!x.find('img, iframe, video').length && !x.text().replace(/[\s ​]/g, '') && !x.html().includes('\u0001')) x.remove();
  });
  // a stray <h1> inside the body would clash with the page title
  $('h1').each((_, e) => { e.tagName = 'h2'; });

  return $;
}

// strong/em: CommonMark flanking rules break `**'x'**한글` – fall back to inline HTML then
const PUNCT = /[\p{P}\p{S}]/u;
function flankSafe(delim, tag) {
  return (content, node) => {
    const inner = content.replace(/^\s+|\s+$/g, '');
    if (!inner) return content;
    const lead = content.match(/^\s*/)[0], trail = content.match(/\s*$/)[0];
    const prevText = node.previousSibling ? (node.previousSibling.textContent || '') : '';
    const nextText = node.nextSibling ? (node.nextSibling.textContent || '') : '';
    const before = lead ? ' ' : prevText.slice(-1), after = trail ? ' ' : nextText.slice(0, 1);
    const isWord = (c) => c && !/\s/.test(c) && !PUNCT.test(c);
    const bad = (PUNCT.test(inner[0]) && isWord(before)) || (PUNCT.test(inner[inner.length - 1]) && isWord(after));
    return bad ? `${lead}<${tag}>${inner}</${tag}>${trail}` : `${lead}${delim}${inner}${delim}${trail}`;
  };
}

function makeTurndown() {
  const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-', emDelimiter: '*', strongDelimiter: '**', hr: '---' });
  td.use(gfm);
  // text like "List<String>" must not be parsed as an HTML tag
  const baseEscape = td.escape.bind(td);
  // "~" too: GFM treats "70~79점, 60~69점" as strikethrough
  // (a "~" with whitespace on both sides can't open/close strikethrough, so leave those alone)
  td.escape = (s) => baseEscape(s).replace(/</g, '\\<')
    .replace(/~/g, (m, i, str) => (/\s/.test(str[i - 1] || ' ') && /\s/.test(str[i + 1] || ' ') ? m : '\\~'));
  td.addRule('strong', { filter: ['strong', 'b'], replacement: flankSafe('**', 'strong') });
  td.addRule('em', { filter: ['em', 'i'], replacement: flankSafe('*', 'em') });
  td.addRule('details', {
    filter: 'details',
    replacement: (content, node) => {
      const s = node.querySelector('summary');
      const summary = s ? s.textContent.trim() : '더보기';
      return `\n\n<details>\n<summary>${summary}</summary>\n\n${content.trim()}\n\n</details>\n\n`;
    },
  });
  td.addRule('summary', { filter: 'summary', replacement: () => '' });
  td.addRule('u', { filter: ['u', 'ins'], replacement: (c) => `<u>${c}</u>` });
  td.addRule('sub-sup', { filter: ['sub', 'sup'], replacement: (c, n) => `<${n.nodeName.toLowerCase()}>${c}</${n.nodeName.toLowerCase()}>` });
  td.addRule('img', {
    filter: 'img',
    replacement: (_, node) => `![${(node.getAttribute('alt') || '').replace(/[[\]]/g, '\\$&')}](${node.getAttribute('src')})`,
  });
  return td;
}

function describe($) {
  const c = $.root().clone();
  c.find('table, img, h1, h2, h3, h4, p.label, p.time').remove();
  // label-only paragraphs ("이번 글의 질문", "핵심 요약", ...)
  c.find('p').each((_, e) => {
    const p = $(e); const t = p.text().trim(); const b = p.children('strong, b');
    if (t && b.length === 1 && b.text().trim() === t) p.remove();
  });
  c.find('p, li, div, br, blockquote').each((_, e) => { $(e).append(' '); });
  let text = c.text().replace(/\u0001PH\d+\u0002/g, ' ').replace(/[\s ​]+/g, ' ').trim();
  text = text.replace(/\u0003/g, '|');
  if ([...text].length > 120) text = [...text].slice(0, 120).join('').replace(/\s+\S*$/, '') + '…';
  return text;
}

const yamlStr = (s) => JSON.stringify(s);

async function convert(id, td) {
  const raw = await fs.readFile(path.join(CACHE, 'html', `${id}.html`), 'utf8');
  const meta = extract(raw);
  const ph = makePlaceholders();
  const $ = cleanBody(id, meta.body, ph);

  const dir = path.join(OUT, String(id));
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });

  // download images
  let n = 0;
  for (const e of $('img').toArray()) {
    const src = $(e).attr('src');
    const dataUri = src.match(/^data:image\/([\w+.-]+);base64,(.*)$/s);
    if (dataUri) { // inline base64 image -> extract to a file
      const ext = { jpeg: 'jpg', 'svg+xml': 'svg' }[dataUri[1]] || dataUri[1];
      const name = `img-${String(++n).padStart(2, '0')}.${ext}`;
      await fs.writeFile(path.join(dir, name), Buffer.from(dataUri[2], 'base64'));
      $(e).attr('src', `./${name}`);
      report.images++; report.dataUriImages = (report.dataUriImages || 0) + 1;
      continue;
    }
    if (!/^https?:/.test(src)) { problem(id, `image with non-http src kept as-is: ${src.slice(0, 80)}`); continue; }
    try {
      const f = await downloadImage(src);
      const name = `img-${String(++n).padStart(2, '0')}${path.extname(f)}`;
      await fs.copyFile(f, path.join(dir, name));
      $(e).attr('src', `./${name}`);
      report.images++;
    } catch (err) {
      report.imageFailed.push(`${id}: ${src} (${err.message})`);
    }
  }

  const description = describe($);
  let md = td.turndown($.html());
  md = ph.restore(md).replace(/\u0003/g, '\\|').replace(/ /g, ' ').replace(/​/g, '');
  md = md.replace(/^(#{1,6} \d+)\\\./gm, '$1.'); // "## 1\. Title" -> "## 1. Title"
  md = md.replace(/[ \t]+$/gm, (m) => (m === '  ' ? m : '')).replace(/\n{3,}/g, '\n\n').trim() + '\n';

  const [category, ...sub] = meta.categoryName.split('/');
  const subcategory = sub.join('/');
  if (!KNOWN_CATEGORIES.includes(category)) problem(id, `unknown category "${meta.categoryName}" kept verbatim`);
  const key = subcategory ? `${category} / ${subcategory}` : category;
  report.categories[key] = (report.categories[key] || 0) + 1;
  if (!meta.date) problem(id, 'missing published_time');

  const fm = [
    '---',
    `title: ${yamlStr(meta.title)}`,
    `date: ${meta.date}`,
    `category: ${yamlStr(category)}`,
    ...(subcategory ? [`subcategory: ${yamlStr(subcategory)}`] : []),
    `tags: [${meta.tags.map(yamlStr).join(', ')}]`,
    `description: ${yamlStr(description)}`,
    `tistoryId: ${id}`,
    '---',
    '',
  ].join('\n');
  await fs.writeFile(path.join(dir, 'index.md'), fm + md, 'utf8');
  report.posts++;
}

const ids = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : JSON.parse(await fs.readFile(path.join(CACHE, 'ids.json'), 'utf8'));
const td = makeTurndown();
for (const id of ids) {
  try { await convert(id, td); process.stdout.write('.'); } catch (e) { problem(id, 'CONVERSION FAILED: ' + e.stack); }
}
console.log();
await fs.writeFile(path.join(HERE, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ ...report, rawTables: [...new Set(report.rawTables)] }, null, 2));
