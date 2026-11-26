# juwkim.github.io

> 배우고, 기록하고, 조금씩 나아갑니다.

[Astro](https://astro.build)로 만든 개인 블로그입니다. `master`에 push하면 GitHub Actions가 빌드해서 GitHub Pages에 배포합니다.

블로그: https://juwkim.github.io · 새 글 쓰는 법: [docs/writing-guide.md](docs/writing-guide.md) · 아키텍처와 개발 여정: [docs/blog-architecture-and-journey.md](docs/blog-architecture-and-journey.md)

새 세션에서 작업을 이어갈 때는 [오르카 인수인계](docs/orca-handoff.md)와 [논의 백로그](docs/discussion-backlog.md)를 읽으세요.

## 설계 방향과 아키텍처 요약

- 정체성: 개인 공부·성장 기록장과 직접 만든 도구를 소개하는 `What I Made` 빌더 포트폴리오를 함께 담습니다.
- 스택과 무서버 운영: Astro 7 정적 빌드, Pagefind 정적 검색, Firebase Auth(Google·GitHub) + Cloud Firestore Lite 지연 로딩 댓글, 프로덕션 전용 GA4로 서버 유지비 없이 운영합니다.
- 빌드 타임 처리 우선: KaTeX 수식(`@astrojs/markdown-remark` `unified`), Shiki 코드 하이라이팅, 본문 링크 새 창(`src/plugins/rehype-link-target.mjs`)을 빌드 시점에 처리해 브라우저 JS를 최소화합니다.
- 3열 풀 와이드 레이아웃: 좌측 `240px` 고정 프로필·카테고리 사이드바, 중앙 `840px` 본문, 홈 우측 `320px` 고정 `What I Made` 레일이 독립 스크롤됩니다.

자세한 배경, 주요 결정, 시행착오 기록과 아키텍처 다이어그램은 [docs/blog-architecture-and-journey.md](docs/blog-architecture-and-journey.md)에서 확인할 수 있습니다.

## 자주 하는 일

| 하고 싶은 것 | 어디를 고치면 되나 |
|---|---|
| 새 글 쓰기 | `npm run new` → 질문에 답하면 글 틀이 생김 (자세히: [docs/writing-guide.md](docs/writing-guide.md)) |
| 카테고리 추가·이름 변경 | `src/site.config.ts`의 `CATEGORIES` |
| `Projects(What I Made)` 수정 | `src/data/projects.ts` |
| About 내용 (꿈, 요즘의 나, 발걸음) | `src/data/about.ts` |
| 홈 문구, 링크, GA4, 댓글 설정 | `src/site.config.ts` |
| 댓글 보안 규칙 수정·배포 | `firestore.rules` (`firebase.json` 기준 배포) |
| 색, 폰트, 간격 | `src/styles/global.css` (맨 위 디자인 토큰) |
| 글 본문 스타일 | `src/styles/prose.css` |

### 글 머리말 형식

```md
---
title: "글 제목"
date: 2026-11-21T10:00:00+09:00
category: "일상"          # Computer Science | Standard Library | 일상
subcategory: "생각과 진로"  # 필수: CATEGORIES에 있는 이름
tags: ["태그1", "태그2"]   # 선택
description: "한 줄 요약"   # 선택 (검색엔진에 노출)
draft: true               # 선택: true면 사이트에 안 보임
---

본문은 Markdown으로.
```

형식이 틀리면 (예: 카테고리 오타) 빌드할 때 에러로 알려줍니다.

## 명령어

CI와 같은 Node.js 26(`.nvmrc`)에서 실행합니다.

```bash
npm ci             # 잠금 파일 기준으로 설치
npm run new        # 새 글 틀 만들기
npm run dev        # 미리보기 → http://localhost:4321 (저장하면 바로 반영)
npm run build      # 검사 + 빌드 + 검색 색인 → dist/
npm run preview    # 빌드 결과 미리보기 (검색 기능 확인용)
```

## 폴더 구조

```text
src/
  content/posts/             글 (Markdown, 글 하나 = 폴더 하나, 카테고리별 폴더)
  data/
    about.ts                 About 페이지 내용
    projects.ts              What I Made 및 /projects/ 데이터
  lib/
    posts.ts                 글 정렬·날짜·읽는 시간 계산
    firebase-comments.ts     Firebase Auth + Cloud Firestore Lite 댓글 클라이언트
  plugins/
    rehype-link-target.mjs   본문 링크 새 창(target="_blank") rehype 플러그인
  site.config.ts             사이트 문구·링크·카테고리·GA4·Firebase 댓글 설정
  pages/                     주소별 페이지 (/, /posts, /projects, /about, /search …)
  layouts/                   공통 틀 (head, 메뉴, 푸터)
  components/                UI 조각 (사이드바, 사진 뷰어, 코드 복사, 댓글 …)
  styles/                    디자인 토큰, 본문 스타일
public/                      그대로 복사되는 파일 (favicon, robots.txt, files/)
scripts/                     글 생성(new-post.mjs), Tistory 이전 도구, 글 주소 목록
docs/
  blog-architecture-and-journey.md  블로그 아키텍처·결정·시행착오 기록
  orca-handoff.md            Orca 새 세션 인수인계 문서
  discussion-backlog.md      논의 기록 및 백로그
  writing-guide.md           새 글 쓰기 가이드
  editing-guide.md           기존 글 교정 가이드
.github/workflows/
  deploy.yml                 GitHub Pages 빌드·배포 및 매일 09:00 KST 예약 발행
  check-links.yml            매주 월요일 09:30 KST 깨진 링크 검사 (lychee)
  dependabot-auto-merge.yml  safe minor/patch Dependabot PR 자동 머지
firestore.rules              Cloud Firestore 댓글 보안 규칙
firebase.json                Firebase CLI 규칙 배포 설정
```

## 글 주소

`/<카테고리>/<세부 카테고리>/<글 폴더 이름>/` (예: `/cs/algorithm/scpc-2026-finals-review/`)

- 카테고리 주소(`cs`, `algorithm` 등)는 `src/site.config.ts`의 `CATEGORIES`에서 정해집니다.
- 글 폴더 이름은 그 글의 핵심 단어를 영문 소문자와 `-`로 짓습니다. (예: `history-21-liberation-korean-war`)
- 글 머리말의 카테고리를 바꾸면 주소도 바뀝니다. 폴더도 같은 카테고리 폴더로 옮겨 두면 찾기 쉽습니다.

## 브랜치

- `master` 하나만 씁니다. push하면 바로 배포됩니다.
- 글 쓰기·작은 수정 → `master`에 바로 커밋
- 디자인 개편처럼 큰 작업 → 브랜치를 만들어 PR → Actions가 빌드 검사 → 통과하면 merge 후 브랜치 삭제
