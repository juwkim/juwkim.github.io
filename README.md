# juwkim.github.io

> 배우고, 기록하고, 조금씩 나아갑니다.

[Astro](https://astro.build)로 만든 개인 블로그입니다. `master`에 push하면 GitHub Actions가 빌드해서 GitHub Pages에 배포합니다.

블로그: https://juwkim.github.io · 새 글 쓰는 법: [docs/writing-guide.md](docs/writing-guide.md)

새 세션에서 작업을 이어갈 때는 [오르카 인수인계](docs/orca-handoff.md)와 [논의 백로그](docs/discussion-backlog.md)를 읽으세요.

## 자주 하는 일

| 하고 싶은 것 | 어디를 고치면 되나 |
|---|---|
| 새 글 쓰기 | `npm run new` → 질문에 답하면 글 틀이 생김 (자세히: `docs/writing-guide.md`) |
| 카테고리 추가·이름 변경 | `src/site.config.ts`의 `CATEGORIES` |
| About 내용 (꿈, 요즘의 나, 발걸음) | `src/data/about.ts` |
| 홈 문구, 링크 | `src/site.config.ts` |
| 색, 폰트, 간격 | `src/styles/global.css` (맨 위 디자인 토큰) |
| 글 본문 스타일 | `src/styles/prose.css` |

### 글 머리말 형식

```md
---
title: "글 제목"
date: 2026-11-21T10:00:00+09:00
category: "일상"          # Computer Science | Standard Library | 일상
subcategory: "생각과 진로"  # 필수 — CATEGORIES에 있는 이름
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

```
src/
  content/posts/   글 (Markdown, 글 하나 = 폴더 하나, 카테고리별 폴더)
  data/about.ts    About 페이지 내용
  site.config.ts   사이트 문구·링크
  pages/           주소별 페이지 (/, /posts, /about, /search …)
  layouts/         공통 틀 (head, 메뉴, 푸터)
  components/      UI 조각 (메뉴, 글 목록 …)
  styles/          디자인 토큰, 본문 스타일
  lib/posts.ts     글 정렬·날짜·읽는 시간 계산
public/            그대로 복사되는 파일 (favicon, robots.txt)
scripts/           Tistory 글 이전 도구
docs/              논의 기록(discussion-backlog.md), 디자인 시안
.github/workflows/ 자동 배포
```

## 글 주소

`/<카테고리>/<세부 카테고리>/<글 폴더 이름>/` — 예: `/cs/algorithm/scpc-2026-finals-review/`

- 카테고리 주소(`cs`, `algorithm` 등)는 `src/site.config.ts`의 `CATEGORIES`에서 정해집니다.
- 글 폴더 이름은 그 글의 핵심 단어를 영문 소문자와 `-`로 짓습니다. (예: `history-21-liberation-korean-war`)
- 글 머리말의 카테고리를 바꾸면 주소도 바뀝니다. 폴더도 같은 카테고리 폴더로 옮겨 두면 찾기 쉽습니다.

## 브랜치

- `master` 하나만 씁니다. push하면 바로 배포됩니다.
- 글 쓰기·작은 수정 → `master`에 바로 커밋
- 디자인 개편처럼 큰 작업 → 브랜치를 만들어 PR → Actions가 빌드 검사 → 통과하면 merge 후 브랜치 삭제
