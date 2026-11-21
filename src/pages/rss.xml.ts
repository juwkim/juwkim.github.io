import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../site.config';
import { getPosts, postUrl } from '../lib/posts';

// 화면에는 링크가 없지만, 검색엔진·RSS 리더용으로 자동 생성됩니다.
export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${SITE.title} — ${SITE.blogName}`,
    description: SITE.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      categories: [post.data.category, ...post.data.tags],
      link: postUrl(post),
    })),
    customData: '<language>ko</language>',
  });
}
