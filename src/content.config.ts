import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES, CATEGORY_NAMES, SUB_NAMES } from './site.config';

// 글 하나 = 폴더 하나: src/content/posts/<카테고리>/<세부>/<영문-주소>/index.md (+ 같은 폴더의 이미지)
// 머리말(frontmatter)이 아래 형식과 다르면 빌드할 때 에러로 알려줍니다.
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z
    .object({
      title: z.string(),
      date: z.coerce.date(),
      category: z.enum(CATEGORY_NAMES),
      subcategory: z.enum(SUB_NAMES),
      tags: z.array(z.string()).default([]),
      description: z.string().optional(),
      tistoryId: z.number().optional(), // Tistory에서 옮겨 온 글의 원래 번호
      draft: z.boolean().default(false), // true면 사이트에 안 보임
    })
    .refine(
      (d) => CATEGORIES.find((c) => c.name === d.category)?.subs.some((s) => s.name === d.subcategory),
      { message: 'subcategory가 category에 속하지 않습니다 (src/site.config.ts의 CATEGORIES 확인)' },
    ),
});

export const collections = { posts };
