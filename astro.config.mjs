// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://juwkim.github.io',
  integrations: [sitemap()],
  markdown: {
    // 수식: $...$ / $$...$$ 를 빌드할 때 HTML로 미리 그려 둠 (방문자 쪽 JS 없음)
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      // 라이트/다크 모드에 따라 코드 색이 자동으로 바뀜 (CSS에서 전환)
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
