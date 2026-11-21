// 글 속 "폴더 링크"(GitHub 파일 목록)를 없애고, 파일 하나하나로 바로 연결합니다. (2026-11-21, 한 번만 실행)
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TREE = 'https://github.com/juwkim/juwkim.github.io/tree/master/';
const enc = (p) =>
  p
    .split('/')
    .map((s) => encodeURIComponent(s).replace(/\(/g, '%28').replace(/\)/g, '%29'))
    .join('/');

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

const report = [];
for (const file of walk('src/content/posts')) {
  let s = readFileSync(file, 'utf8');
  const before = s;

  // 1) "[SessionNN 실습 폴더](폴더) · " 제거 — 같은 줄과 아래 줄에 파일 링크가 이미 있음
  s = s.replace(/\[Session\d+ 실습 폴더\]\(https:\/\/github\.com\/juwkim\/juwkim\.github\.io\/tree\/master\/[^)\s]+\) · /g, '');

  // 2) 이미지 폴더 링크 → 파일별 링크 "이름: [A.png](..) · [B.png](..)"
  s = s.replace(/\[([a-z_]+): [^\]]+\]\(https:\/\/github\.com\/juwkim\/juwkim\.github\.io\/tree\/master\/([^)\s]+)\)/g, (m, label, encDir) => {
    const dir = decodeURIComponent(encDir);
    if (!existsSync(dir)) {
      report.push(`없는 폴더: ${file} ${dir}`);
      return m;
    }
    const files = readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile()).sort();
    const url = (f) => '/' + enc(join(dir, f).replace(/\\/g, '/').replace(/^public\//, ''));
    return `${label}: ` + files.map((f) => `[${f}](${url(f)})`).join(' · ');
  });

  // 3) 드라이브 시절의 링크 툴팁 제거
  s = s.replace(/ "Google Drive에서 [^"]*"\)/g, ')');

  if (s !== before) writeFileSync(file, s);
}

// 남은 폴더 링크 확인
for (const file of walk('src/content/posts')) {
  if (readFileSync(file, 'utf8').includes(TREE)) report.push(`폴더 링크 남음: ${file}`);
}
console.log(report.length ? report.join('\n') : '폴더 링크 모두 정리됨');
