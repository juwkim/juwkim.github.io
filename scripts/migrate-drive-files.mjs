// 글에 걸린 구글 드라이브 링크를 레포 안 파일(public/files/...)로 바꿉니다. (2026-11-21, 한 번만 실행)
//
// 준비물 (레포 밖, 공개되지 않음):
//   STAGING   : rclone으로 내려받은 '국방 AI 경진대회' 자료 폴더
//   INDEX     : rclone lsjson -R --drive-shared-with-me 결과 (드라이브 파일 ID → 경로)
// 사용법: node scripts/migrate-drive-files.mjs [--dry]
import { readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DRY = process.argv.includes('--dry');
const PRIVATE = 'C:/Users/Juwon/juwkim-private';
const STAGING = `${PRIVATE}/maicon-files`;
const INDEX = `${PRIVATE}/drive-shared-index.json`;
const DRIVE_ROOT = 'move/공모전/국방 AI 경진대회/';
const DEST = 'public/files/maicon-2026'; // 사이트 주소: /files/maicon-2026/...
const REPO_TREE = 'https://github.com/juwkim/juwkim.github.io/tree/master/';

// 드라이브 폴더 이름 → 레포 폴더 이름 (주소에 쓰기 좋게)
const RENAME = { '1. 수업 자료': 'lectures', '2. 코드': 'code', '3. 심화자료': 'practice' };
const mapPath = (drivePath) => {
  const rel = drivePath.slice(DRIVE_ROOT.length);
  const [top, ...rest] = rel.split('/');
  return [RENAME[top] ?? top, ...rest].join('/');
};
// 괄호는 Markdown 링크를 끊으므로 따로 인코딩
const encodePath = (p) =>
  p
    .split('/')
    .map((s) => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29'))
    .join('/');

// 1) 파일 복사
if (!DRY) {
  mkdirSync(DEST, { recursive: true });
  for (const name of readdirSync(STAGING)) {
    const target = join(DEST, RENAME[name] ?? name);
    cpSync(join(STAGING, name), target, { recursive: true });
  }
}

// 2) 링크 바꾸기
const index = new Map(JSON.parse(readFileSync(INDEX, 'utf8')).map((x) => [x.ID, x]));
const LINK = /https?:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|drive\/folders\/|open\?id=|uc\?id=)([A-Za-z0-9_-]{20,})[^\s)"<>]*/g;

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

let changed = 0;
const missing = new Set();
for (const file of walk('src/content/posts')) {
  const src = readFileSync(file, 'utf8');
  const out = src.replace(LINK, (url, id) => {
    const item = index.get(id);
    if (!item || !item.Path.startsWith(DRIVE_ROOT)) {
      missing.add(`${file}: ${url}`);
      return url;
    }
    const rel = mapPath(item.Path);
    changed++;
    return item.IsDir
      ? `${REPO_TREE}${encodePath(`${DEST}/${rel}`)}` // 폴더: 깃허브에서 파일 목록 보기
      : `/files/maicon-2026/${encodePath(rel)}`; // 파일: 블로그 주소로 바로 내려받기
  });
  if (out !== src && !DRY) writeFileSync(file, out);
}
console.log(`${DRY ? '[dry] ' : ''}링크 ${changed}개 변경`);
if (missing.size) console.log('바꾸지 못한 링크:\n' + [...missing].join('\n'));
