# Orca 인수인계 — 공개 Astro 블로그

2026년 11월 22일(한국 시간) 기준입니다. 결정의 배경과 보류 항목은 [논의 백로그](discussion-backlog.md)에 있습니다.

## 0. 새 세션 읽기 순서

1. [`AGENTS.md`](../AGENTS.md)에서 위임, 답변 형식, 작업 범위를 확인합니다.
2. [`docs/discussion-backlog.md`](discussion-backlog.md)에서 확정된 결정과 남은 일을 확인합니다.
3. 새 글을 쓸 때는 [글쓰기 가이드](writing-guide.md), 기존 글을 다듬을 때는 [교정 가이드](editing-guide.md)를 읽습니다.
4. [README](../README.md)에서 명령어와 브랜치 전략을 확인합니다.

## 1. 목적

- 개인 공부, 일상, 생각을 기록하는 공개 Astro 정적 블로그입니다.
- Tistory 글 105편 이전, 다듬기, About 구성, 배포가 끝나 현재는 운영과 소규모 개선 단계입니다.
- About에는 앞으로의 방향과 지나온 발걸음을 담습니다.

## 2. 로컬 시작

기존 체크아웃에서는 `git status --short --branch`로 진행 중인 변경을 먼저 확인합니다. 깨끗한 `master`에서는 `git pull --ff-only origin master`로 인수인계 문서까지 내려받을 수 있습니다. 새로 받는다면 [원격 저장소](https://github.com/juwkim/juwkim.github.io)를 클론합니다.

| 단계 | 명령 | 비고 |
|---|---|---|
| Node 준비 | `.nvmrc` 버전(Node.js 26) 설치·선택 | 버전 관리자 또는 공식 설치본을 사용하고 `node -v`로 26.x인지 확인 |
| 의존성 | `npm ci` | lockfile 기준으로 설치 |
| 개발 | `npm run dev` | `http://localhost:4321` |
| 빌드 | `npm run build` | Astro check, 정적 빌드, Pagefind 색인을 거쳐 `dist/` 생성 |
| 검색 확인 | `npm run preview` | Pagefind 검색은 빌드 결과물에서만 동작 |

- Cloud 온보딩 기록: Node 26.13.1을 `npm exec`로 별도 설치해 테스트했습니다. 샌드박스에서는 `ASTRO_TELEMETRY_DISABLED=1`을 사용했습니다.
- 로컬 작업은 Cloud 경로나 설정에 의존하지 않습니다.

## 3. 배포와 브랜치

- `master`에 push하면 GitHub Actions가 GitHub Pages로 배포합니다. PR에서는 빌드 검사만 실행합니다.
- 기본 브랜치는 `master` 하나입니다. 큰 작업만 임시 브랜치 → PR → merge 후 삭제합니다(README 기준).
- push 이후에는 Actions 성공 여부와 공개 URL 반영 여부를 **따로** 확인하고 보고합니다.
- 인수인계 직전 기준 커밋은 `b95c897`입니다. 이 커밋의 Pages 배포 성공과 공개 홈·About·사진 갤러리 마크업·giscus 설정·검색엔진 소유 확인 태그를 확인했습니다. 같은 시점에 로컬 프로덕션 빌드는 Astro 오류 0건, 정적 페이지 133개, Pagefind 색인 108페이지였습니다.

## 4. 주요 경로

| 대상 | 경로 |
|---|---|
| 사이트 설정(카테고리, 공개 링크, 소유 확인, giscus) | `src/site.config.ts` |
| 홈과 About 화면 | `src/pages/index.astro`, `src/pages/about.astro` |
| About의 문구·목표·이력 | `src/data/about.ts` |
| 글 원고와 이미지 | `src/content/posts/` |
| 글 상세 라우트 | `src/pages/[category]/[sub]/[slug].astro` |
| 글 주소 목록 | `scripts/post-slugs.json` |
| About 연락처 | `src/components/ProfileContacts.astro` |
| 사진 뷰어 | `src/components/PostImageViewer.astro` |
| 댓글 | `src/components/Comments.astro` |
| 배포·의존성 점검 | `.github/workflows/deploy.yml`, `.github/dependabot.yml` |
| 프로필 사진 / 첨부 자료 | `src/assets/avatar.jpg` / `public/files/maicon-2026/` |

- 공개 사이트에서 [홈](https://juwkim.github.io/), [About](https://juwkim.github.io/about/), [갤러리와 댓글이 있는 글](https://juwkim.github.io/cs/algorithm/scpc-2026-finals-review/)을 확인할 수 있습니다.
- 카테고리 이름 Computer Science, Standard Library, 일상과 주소 `cs`, `stdlib`, `life`를 유지합니다. 도메인은 `juwkim.github.io`를 사용합니다.

## 5. 최근 변경과 유효한 결정

- **About**
  - 프로필 링크 순서는 GitHub → Instagram → solved.ac입니다.
  - 그 아래에 `Email` 라벨과 평문 이메일을 둡니다. mailto와 복사 버튼은 없고 드래그로 선택합니다.
  - 연락처 값은 기존 공개 설정만 사용합니다.
  - 섹션 순서: 평생의 나침반 → 가꿔 갈 꿈(5~10년) → 요즘의 나(지금~1년) → 지나온 발걸음
  - 건강 문구는 매일 완벽하게 지키기보다 "몸을 아끼는 방향"을 강조합니다.
  - 요즘의 나에는 주변 사람들의 불편을 관찰하고 도울 방법을 고민하는 항목을 둡니다.
  - 일의 포부는 기술로 사람의 시간을 돌려주고 더 중요한 일에 시간을 쓸 수 있게 돕는다는 문장으로 정리했습니다. 이력 항목은 현재 구성으로 충분합니다.
- **solved.ac 9,174문제**: 2026-11-21에 공식 수치를 확인했습니다. 저장소에 옮겨 둔 풀이 기록 수는 계정 전체 수치가 아닙니다.
- **홈**: 연락처 묶음을 추가했다가 제거했습니다. 기존 About 바로가기는 유지합니다.
- **사진 뷰어**
  - native `<dialog>`를 사용하며, 화면 맞춤과 확대를 지원합니다.
  - 필름 미리보기와 이전·다음 사진 미리 불러오기를 제공합니다.
  - 버튼, 좌우 방향키, Esc로 조작합니다.
  - reduced motion과 모바일 동작을 확인했습니다.
  - 링크가 걸린 이미지는 원래 링크 목적지로 이동합니다. 세로 사진에 별도 높이 제한은 두지 않습니다.
- **giscus**
  - 공개 저장소의 Discussions General 카테고리에 연결했습니다.
  - pathname 매핑, 테마 동기화, lazy 로딩을 적용했습니다.
  - 실제 Chrome 브라우저에서 `iframe.giscus-frame` 렌더링, 한국어 UI, 다크/라이트 테마 동기화를 확인했습니다(2026-11-22).
  - 실제 GitHub 로그인 후 테스트 댓글 작성·Discussions 자동 생성·giscus API 연동을 확인했고, 테스트용 Discussion #3은 삭제했습니다(2026-11-22).
- **SEO**
  - Google과 Naver 소유 확인 HTML 태그를 배포했으며, 계속 유지합니다.
  - 사용자가 Google에는 사이트맵(`sitemap-index.xml`)을, Naver에는 사이트맵과 RSS(`rss.xml`)를 제출했습니다.
  - 2026-11-22 콘솔 확인 결과:
    - **Google Search Console**: 소유 확인 완료, `robots.txt` 유효, 직접 조치·보안 문제 없음. 루트(`https://juwkim.github.io/`) URL 검사에서는 색인 생성 확인(2026-11-22 12:30 크롤링)되었으나, 전체 `색인 생성 → 페이지` 리포트는 집계 대기 중이고 `/sitemap-index.xml`은 `가져올 수 없음`("일시적인 처리 오류", 실제 `sitemap-index.xml`·`sitemap-0.xml` HTTP 200 정상) 상태로 재확인이 필요합니다.
    - **네이버 서치어드바이저**: 소유 확인 완료, 사이트맵(`2026-11-22 11:08:53`)·RSS(`2026-11-22 11:09:14`) 등록 완료. 사이트 진단·수집 현황·노출/클릭 리포트는 신규 등록 초기라 아직 집계 전입니다.
- **Dependabot**
  - npm과 GitHub Actions를 분기마다 점검해 PR을 만듭니다. 자동 merge는 하지 않습니다.
  - 첫 PR #2(`typescript` `6.0.3 → 7.0.2`)는 `@astrojs/check@0.9.12`의 peer 의존성 충돌(`ERESOLVE`)로 빌드가 실패해 `@dependabot ignore this major version`으로 보류·종료했습니다(2026-11-22).
- **Google Drive**: Cloud Drive 연결과 rclone 전용 `client_id` 설정은 진행하지 않습니다. 로컬 Windows 환경에서는 데스크톱용 Google 드라이브(`G:\내 드라이브`)를 설치해 일반 파일을 읽기 전용 원칙으로 참조할 수 있습니다(2026-11-22 확인, `.gdoc`/`.gsheet`는 웹 바로가기 파일).
- **Discipline**: 원본 위치와 제목은 확인했습니다. 링크는 공개하지 않습니다.
- **'Who is'**: 해당 내용은 About에 이미 반영했습니다. 별도 글로 공개하지 않습니다.

## 6. 커밋 흔적 (묶음)

| 주제 | 커밋 |
|---|---|
| About 프로필·문구 | `b1b2c9b`, `1619be6`, `81a46d0`, `0a66613`, `f099aa8` |
| 사진 뷰어 | `f099aa8`, `388eb46` |
| 홈 연락처 추가→제거 | `24c7b7f`, `7dfee44`, `b95c897` |
| giscus·Dependabot | `24c7b7f`, `2d28db4` |
| 검색엔진 | `ddfb0c5`, `77d9fb0`, `bfa7d58` |
| 에이전트 지침 | `b7a0813`, `3589a65` |

## 7. 남은 일

- **핵심**: 2026-12-18 이후 정보처리기사 실제 결과를 사용자에게 확인합니다. 결과에 따라 About의 "응시" 표기와 백로그를 갱신합니다.
- **운영 확인**
  - 구글·네이버 콘솔에서 검색 색인 집계 및 Google Search Console `/sitemap-index.xml` 처리 상태 재확인
  - 이후 새로 생성되는 Dependabot PR 검토 (PR #2 `typescript 7.0.2`는 무시 처리 완료)

## 8. 위임과 보안

- 가능하면 기본 위임 모델은 Claude Opus 5.5 medium입니다. 위임 범위, 실제 상태, 검증 결과를 보고합니다.
- 푸시 상태와 배포 상태는 각각 따로 적습니다. 답변 끝에는 백로그의 대기 항목을 문서 순서대로 붙입니다.
- Messages API는 stateless입니다. 위임할 때마다 필요한 현재 맥락을 명시적으로 전달합니다.
- 새 환경에서 Claude 호출을 쓸 때는 연결 상태와 인증을 별도로 확인합니다. 필요하면 작업 관련 지침, 코드, 백로그 발췌를 요청에 포함합니다.
- 공개 저장소의 인수인계에는 구현에 필요한 결정과 결과를 남깁니다. API 키, 인증 자료, 공유받은 시트 URL, 대화 원문은 개인 환경에서 관리합니다.

## 9. 첫 프롬프트 (그대로 붙여 넣기)

```text
docs/orca-handoff.md, AGENTS.md, docs/discussion-backlog.md를 읽고 현재 블로그 상태, 유지할 결정, 검증이 남은 일과 논의 백로그를 요약해서 다음 작업을 이어갈 수 있게 해줘.
```
