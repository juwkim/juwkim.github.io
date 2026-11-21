// 새 글 틀 만들기
//
//   npm run new                      → 질문에 답하며 만들기
//   npm run new -- "글 제목" life thoughts my-new-post
//                   제목      카테고리 세부      주소(영문)
//
// 만들어지는 파일: src/content/posts/<카테고리>/<세부>/<주소>/index.md
// 처음에는 draft: true (사이트에 안 보임). 다 쓰면 draft 줄을 지우고 push.
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { CATEGORIES } from '../src/site.config.ts';

const [argTitle, argCat, argSub, argSlug] = process.argv.slice(2);
const rl = createInterface({ input: stdin, output: stdout });
const ask = async (q, fallback) => fallback ?? (await rl.question(q)).trim();

const pick = async (label, items, given) => {
  if (given) {
    const found = items.find((x) => x.slug === given || x.name === given);
    if (found) return found;
    console.log(`"${given}"는 없는 ${label}입니다.`);
  }
  console.log(`\n${label}:`);
  items.forEach((x, i) => console.log(`  ${i + 1}. ${x.name} (${x.slug})`));
  for (;;) {
    const a = await rl.question('번호 또는 slug: ');
    const found = items[Number(a) - 1] ?? items.find((x) => x.slug === a.trim());
    if (found) return found;
  }
};

const title = await ask('글 제목: ', argTitle);
const cat = await pick('카테고리', CATEGORIES, argCat);
const sub = await pick('세부 카테고리', cat.subs, argSub);
let slug = await ask('\n주소에 쓸 영문 (예: opic-im2-review, 소문자와 -만): ', argSlug);
slug = slug.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
rl.close();

if (!title || !slug) {
  console.error('제목과 주소는 꼭 필요합니다.');
  process.exit(1);
}

const dir = join('src/content/posts', cat.slug, sub.slug, slug);
const file = join(dir, 'index.md');
if (existsSync(file)) {
  console.error(`이미 있는 글입니다: ${file}`);
  process.exit(1);
}

// 한국 시간 기준 지금
const now = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 19) + '+09:00';
const q = (s) => JSON.stringify(s);

mkdirSync(dir, { recursive: true });
writeFileSync(
  file,
  `---
title: ${q(title)}
date: ${now}
category: ${q(cat.name)}
subcategory: ${q(sub.name)}
tags: []
description: ""
draft: true
---

여기에 본문을 씁니다.

<!--
사진은 이 폴더에 넣고 아래처럼 씁니다. (주석을 풀고 파일 이름을 맞추세요)

![사진 설명](./photo-01.jpg)

*사진 아래 캡션*
-->
`,
);

console.log(`\n만들었습니다: ${file}`);
console.log(`글 주소(공개 후): https://juwkim.github.io/${cat.slug}/${sub.slug}/${slug}/`);
console.log('미리보기: npm run dev → http://localhost:4321 (draft 글은 미리보기에서만 보이고 사이트에는 안 나옵니다)');
