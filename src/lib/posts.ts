import { getCollection, type CollectionEntry } from 'astro:content';
import { CATEGORIES, type Category } from '../site.config';

export type Post = CollectionEntry<'posts'>;
export type Sub = Category['subs'][number];

/** 공개된 글 전체, 최신순 */
export async function getPosts(): Promise<Post[]> {
  // draft 글: 로컬 미리보기(npm run dev)에서는 보이고, 실제 사이트에서는 숨김
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const findCategory = (name: string) => CATEGORIES.find((c) => c.name === name)!;
export const findSub = (cat: Category, name: string) => cat.subs.find((s) => s.name === name)! as Sub;

export const categoryUrl = (cat: Category) => `/${cat.slug}/`;
export const subUrl = (cat: Category, sub: Sub) => `/${cat.slug}/${sub.slug}/`;

/** 글 폴더 이름 = 주소 마지막 부분 */
export const postSlug = (post: Post) => post.id.split('/').pop()!;

/** 글 주소: /<카테고리>/<세부>/<글 폴더 이름>/ — 머리말의 카테고리로 정해짐 */
export function postUrl(post: Post): string {
  const cat = findCategory(post.data.category);
  const sub = findSub(cat, post.data.subcategory);
  return `${subUrl(cat, sub)}${postSlug(post)}/`;
}

/** 사이드바용: 카테고리별·세부 카테고리별 글 수 */
export function countTree(posts: Post[]) {
  return CATEGORIES.map((cat) => ({
    cat,
    count: posts.filter((p) => p.data.category === cat.name).length,
    subs: cat.subs.map((sub) => ({
      sub,
      count: posts.filter((p) => p.data.category === cat.name && p.data.subcategory === sub.name).length,
    })),
  }));
}

const KST = 'Asia/Seoul';

/** 10.24 처럼 짧은 날짜 (올해가 아니면 2025.10.24) */
export function shortDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, p) => ((acc[p.type] = p.value), acc), {});
  const thisYear = new Intl.DateTimeFormat('ko-KR', { timeZone: KST, year: 'numeric' }).format(new Date());
  const md = `${parts.month}.${parts.day}`;
  return thisYear.startsWith(parts.year) ? md : `${parts.year}.${md}`;
}

/** 2026년 10월 24일 */
export function longDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: KST, dateStyle: 'long' }).format(date);
}

/** 읽는 시간 (한글 기준 분당 약 500자) */
export function readingMinutes(body = ''): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|\-\[\]()]/g, ' ')
    .replace(/\s+/g, '');
  return Math.max(1, Math.round(text.length / 500));
}
