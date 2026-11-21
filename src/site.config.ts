// 사이트 전체에서 쓰는 문구, 링크, 카테고리. 여기만 고치면 전체에 반영됩니다.
export const SITE = {
  title: 'juwkim',
  homeTitle: 'juwkim의 이야기', // 홈 화면 브라우저 탭 이름
  blogName: 'The Heuristic Learner',
  author: '김주원',
  authorEn: 'Juwon Kim',
  url: 'https://juwkim.github.io',
  description: '공부와 일상, 그리고 그 안에서 자라는 생각들을 차곡차곡 모아 두는 공간입니다.',
  hero: {
    title: ['배우고, 기록하고,', '조금씩 나아갑니다.'],
    body: '공부와 일상, 그리고 그 안에서 자라는 생각들을 차곡차곡 모아 두는 공간입니다.',
  },
  links: {
    github: 'https://github.com/juwkim',
  },
};

/**
 * 카테고리 구조. 글 주소가 여기서 정해집니다: /<카테고리 slug>/<세부 slug>/<글 폴더 이름>/
 * - name: 글 머리말(category, subcategory)에 쓰는 이름
 * - slug: 주소에 쓰는 영문 이름 (바꾸면 그 아래 글 주소가 모두 바뀜)
 * 세부 카테고리를 추가하려면 subs에 한 줄 추가하세요.
 */
export const CATEGORIES = [
  {
    name: 'Computer Science',
    slug: 'cs',
    subs: [
      { name: '알고리즘', slug: 'algorithm' },
      { name: '데이터 분석', slug: 'data-analysis' },
      { name: 'AI', slug: 'ai' },
      { name: '소프트웨어 공학', slug: 'software-engineering' },
      { name: '데이터베이스', slug: 'database' },
      { name: '네트워크·통신', slug: 'network' },
      { name: '정보보안', slug: 'security' },
    ],
  },
  {
    name: 'Standard Library',
    slug: 'stdlib',
    subs: [
      { name: '한국사', slug: 'korean-history' },
      { name: '어학', slug: 'language' },
      { name: '오피스', slug: 'office' },
      { name: '운전·기능', slug: 'skills' },
    ],
  },
  {
    name: '일상',
    slug: 'life',
    subs: [
      { name: '생각과 진로', slug: 'thoughts' },
      { name: '공부와 성장', slug: 'growth' },
      { name: '글쓰기와 편지', slug: 'letters' },
      { name: '일상 기록', slug: 'daily' },
      { name: 'AI와 사회', slug: 'ai-and-society' },
      { name: '생활정보', slug: 'tips' },
    ],
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryName = Category['name'];
export type SubName = Category['subs'][number]['name'];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name) as [CategoryName, ...CategoryName[]];
export const SUB_NAMES = CATEGORIES.flatMap((c) => c.subs.map((s) => s.name)) as [SubName, ...SubName[]];
