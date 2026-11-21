// 글 폴더의 큰 원본 이미지를 줄여서 레포 용량을 관리합니다. (파일 이름·형식은 그대로)
// 사용법: node scripts/optimize-images.mjs [폴더=src/content/posts]
// 화면에 보이는 이미지는 Astro가 빌드할 때 따로 WebP로 최적화하므로, 여기서는 원본 보관용 크기만 줄입니다.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const ROOT = process.argv[2] ?? 'src/content/posts';
const MAX_WIDTH = 1600; // 본문 폭(680px)의 2배 이상 → 레티나에서도 선명
const MIN_BYTES = 300 * 1024; // 이보다 작은 파일은 건드리지 않음

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let before = 0;
let after = 0;
let changed = 0;
for await (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
  const size = (await stat(file)).size;
  before += size;
  if (size < MIN_BYTES) {
    after += size;
    continue;
  }
  const input = await readFile(file);
  const base = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });
  let out =
    ext === '.png'
      ? await base.png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
      : await base.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  // PNG가 여전히 크면 색상 수를 줄여 본다 (스크린샷은 거의 차이 없음)
  if (ext === '.png' && out.length > 800 * 1024) {
    const pal = await sharp(out).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();
    if (pal.length < out.length) out = pal;
  }
  if (out.length < size) {
    await writeFile(file, out);
    after += out.length;
    changed++;
  } else {
    after += size;
  }
}
const mb = (n) => (n / 1024 / 1024).toFixed(1) + 'MB';
console.log(`${changed}개 파일 최적화: ${mb(before)} → ${mb(after)}`);
