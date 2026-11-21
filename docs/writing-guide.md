# 새 글 쓰는 방법

블로그: https://juwkim.github.io

글은 세 가지 방법 중 편한 것으로 씁니다. 어느 방법이든 `master`에 올라가면 1~2분 뒤 사이트에 반영됩니다.

| 방법 | 언제 좋은가 |
|---|---|
| A. Claude와 함께 쓰기 | 자료가 많거나, 생각만 있고 정리가 필요할 때 |
| B. VS Code로 직접 쓰기 | 짧은 글, 바로 고치고 싶을 때 |
| C. GitHub 웹에서 쓰기 | 컴퓨터에 개발 환경이 없을 때, 휴대폰으로 급히 고칠 때 |

글 다듬기 기준은 `docs/editing-guide.md`에 있습니다.

---

## A. Claude와 함께 쓰기

Claude에게 이렇게 말하면 됩니다.

> "OPIc 후기 글 쓰자. 일상 > 공부와 성장에. 메모는 이거야: …"

- 메모, 사진, 드라이브 문서, 링크 무엇이든 주면 Claude가 초안을 쓰고 사진을 정리(위치 정보 제거, 크기 조절)해서 올립니다.
- 초안은 화면으로 먼저 보여주고, 확인을 받은 뒤 사이트에 올립니다.

---

## B. VS Code로 직접 쓰기

### 1. 글 틀 만들기

레포 폴더에서 터미널을 열고:

```bash
npm run new
```

질문에 답하면(제목, 카테고리, 세부 카테고리, 영문 주소) 글 파일이 만들어집니다.

```bash
# 한 줄로도 됩니다: 제목 / 카테고리 / 세부 / 주소
npm run new -- "OPIc IH 후기" life growth opic-ih-review
```

만들어지는 위치: `src/content/posts/<카테고리>/<세부>/<주소>/index.md`

카테고리와 세부 카테고리의 영문 이름은 `src/site.config.ts`의 `CATEGORIES`에 있습니다.

| 카테고리 | 영문 | 세부 (영문) |
|---|---|---|
| Computer Science | `cs` | 알고리즘 `algorithm`, 데이터 분석 `data-analysis`, AI `ai`, 소프트웨어 공학 `software-engineering`, 데이터베이스 `database`, 네트워크·통신 `network`, 정보보안 `security` |
| Standard Library | `stdlib` | 한국사 `korean-history`, 어학 `language`, 오피스 `office`, 운전·기능 `skills` |
| 일상 | `life` | 생각과 진로 `thoughts`, 공부와 성장 `growth`, 글쓰기와 편지 `letters`, 일상 기록 `daily`, AI와 사회 `ai-and-society`, 생활정보 `tips` |

### 2. 쓰기

- 본문은 Markdown으로 씁니다. 큰 제목은 `##`, 그 아래는 `###`.
- 사진은 글 폴더 안에 넣고 `![사진 설명](./파일이름.jpg)`로 씁니다. 사진 바로 아래 줄에 `*캡션*`을 쓰면 캡션이 됩니다.
- `description`에 한두 문장 요약을 쓰면 글 목록과 검색 결과에 보입니다.
- 수식은 `$...$`, 코드는 ```` ```python ```` 처럼 언어를 붙입니다.

### 3. 미리보기

```bash
npm run dev
```

http://localhost:4321 에서 저장할 때마다 바로 바뀝니다. `draft: true`인 글은 **미리보기에서만 보이고 실제 사이트에는 나오지 않습니다.**

### 4. 올리기

1. 머리말의 `draft: true` 줄을 지웁니다.
2. 커밋하고 push합니다.

```bash
git add .
git commit -m "새 글: OPIc IH 후기"
git push
```

1~2분 뒤 `https://juwkim.github.io/<카테고리>/<세부>/<주소>/`에서 볼 수 있습니다.

---

## C. GitHub 웹에서 쓰기

1. https://github.com/juwkim/juwkim.github.io/tree/master/src/content/posts 에 들어갑니다.
2. 카테고리 폴더 → 세부 폴더로 들어간 뒤 **Add file → Create new file**을 누릅니다.
3. 파일 이름 칸에 `영문-주소/index.md`를 씁니다. (`/`를 치면 폴더가 만들어집니다)
4. 아래 머리말을 붙여 넣고 본문을 씁니다.

```md
---
title: "글 제목"
date: 2026-11-21T20:00:00+09:00
category: "일상"
subcategory: "공부와 성장"
tags: []
description: "한두 문장 요약"
---

본문
```

5. **Commit changes**를 누르면 1~2분 뒤 사이트에 반영됩니다.
6. 사진은 같은 폴더에서 **Add file → Upload files**로 올리고, 본문에 `![설명](./파일이름.jpg)`로 씁니다.

`category`와 `subcategory`는 위 표의 한글 이름과 정확히 같아야 합니다. 틀리면 배포가 실패하고, GitHub의 Actions 탭에 빨간 표시가 뜹니다.
