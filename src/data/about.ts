// About 페이지 내용. 여기만 고치면 About 페이지에 반영됩니다.
// 출처: 구글 드라이브 'Who is 김주원' 문서, '내일을 그리다' 만다라트, 사용자 답변 (2026-11-21)

export const profile = {
  name: '김주원',
  // 한 줄 = 화면의 한 줄 (넓은 화면 기준)
  tagline: ['큰 꿈을 품고, 오늘도 작은 한 걸음을 내딛습니다.', '가끔은 신나서 뛰다가 넘어지기도 하지만요.'],
  // 프로필 사진: src/assets/avatar.jpg (GitHub 프로필 사진). 바꾸려면 이 파일만 교체
};

/** 평생의 나침반 — 20~30년, 그리고 평생에 걸쳐 품을 일과 삶의 방향 (일 · 삶) */
export const aspirations = [
  {
    label: '일',
    title: '기술로 사람의 시간을 돌려주는 일',
    body: '사람들이 더 중요한 일에 시간을 쓸 수 있게 돕고 싶습니다.',
  },
  {
    label: '삶',
    title: '가족과 함께 웃으며, 오래도록',
    body: '사랑하는 사람들과 한 식탁에 둘러앉아 하루를 나누며 웃는 일상을 지키고 싶습니다.',
  },
];

/** 가꿔 갈 꿈 — 앞으로 5~10년의 방향 4가지 (건강, 관계, 영어, 성찰). 이루면 done: true (빈 원 → 채운 원) */
export const dreams = [
  { title: '건강한 몸을 오래 돌보기', why: '하루쯤 쉬어 가더라도, 몸을 아끼는 방향은 놓지 않도록', done: false },
  { title: '좋은 사람들과 함께하기', why: '서로에게 편안한 사람으로 오래 곁에 있을 수 있도록', done: false },
  { title: '영어를 익혀 더 넓은 곳으로 나아가기', why: '읽고, 듣고, 말하는 데 막힘이 없을 때까지', done: false },
  { title: '지금의 고민 속에서 나에게 더 맞는 방향 찾아가기', why: '정답보다 방향을 먼저 묻는 습관', done: false },
];

/** 요즘의 나 — 지금부터 1년 안의 공부·습관·관심사 4칸. 한 달에 한 번쯤 업데이트 */
export const now = {
  updated: '2026년 11월',
  items: [
    {
      label: '공부',
      text: 'OPIc 준비 중. 시험 영어로 기초를 단단히 다진 뒤, 실전 회화로 넘어가려 합니다.',
    },
    {
      label: '고민',
      text: 'AI가 당연해진 시대에 나만의 강점은 무엇일까. 앞서가는 사람들은 무엇이 다르고, 나는 어떻게 그 능력을 기를 수 있을까.',
    },
    {
      label: '습관',
      text: '외출 전 선크림, 하루 물 2L는 이미 몸에 붙었습니다. 요즘은 꾸준히 몸을 움직이며 돌보는 중.',
    },
    {
      label: '살피는 일',
      text: '주변 사람들이 어떤 일에서 불편함을 느끼는지, 어떤 도움이 있으면 조금 더 편해질지 유심히 보며 고민하고 있습니다.',
    },
  ],
};

/** 지나온 발걸음 — 최신이 위로. link가 있으면 오른쪽에 링크 표시 (linkLabel 기본값: 후기) */
export const steps: { date: string; title: string; note: string; link?: string; linkLabel?: string }[] = [
  {
    date: '2026.11',
    title: '국방 AI 경진대회(MAICON) 스페이스뱅크 대표상',
    note: '피지컬A100 팀. 로봇에 AI를 입혀 모의 군사 임무를 수행한 본선',
    link: '/cs/ai/maicon-2026-finals-review/',
  },
  { date: '2026.10', title: 'SK하이닉스 AI 해커톤 2차 예선 진출', note: '1차 예선을 통과하고 2차 예선까지' },
  {
    date: '2026.10',
    title: '정보처리기사 실기 응시',
    note: '가채점 83점, 12월 18일 발표를 기다리는 중',
    link: '/cs/software-engineering/engineer-exam-2026-3-practical-review/',
  },
  {
    date: '2026.10',
    title: '헌혈 70회',
    note: '2019년부터 이어 온 나눔. 사회복지 봉사 82회, 348시간과 함께',
    link: '/life/daily/blood-donation-70-times/',
    linkLabel: '기록',
  },
  {
    date: '2026.08',
    title: 'SCPC 본선 진출',
    note: '2025년에 이어 2년 연속',
    link: '/cs/algorithm/scpc-2026-finals-review/',
  },
  {
    date: '2026',
    title: '자격증 8개 취득',
    note: '시험을 이정표 삼아 데이터, AI, 소프트웨어 테스트까지 공부의 폭을 넓힌 해. CSTS, ADsP, 빅데이터분석기사, AICE Associate, PCCP Lv.4, SQLD, COS Pro 1급, 한국사능력검정시험 3급',
    link: '/posts/',
    linkLabel: '글 보기',
  },
  { date: '꾸준히', title: '백준 9,174문제 해결', note: '문제를 풀고, 풀이를 기록으로 남기는 습관' },
  { date: '2024.09', title: '42서울 7기 본과정 수료', note: 'C, Unix, OS, 그래픽스를 동료들과 부딪히며 배운 2년' },
  { date: '2023', title: '성균관대 SW 창업 지원 사업 선정', note: '스타트업 창업 프로젝트 진행' },
  {
    date: '2022.11',
    title: '창의적 종합설계 경진대회 산업통상자원부 장관상',
    note: "팀 '매의 눈' 팀장. 카메라로 만드는 전자칠판",
  },
  { date: '2021~24', title: '러닝 동아리 스꾸런 회장', note: '마라톤 풀코스 완주' },
  { date: '2021.10', title: '특허 출원', note: '딥러닝 기반 변형 악플 탐지 및 순화어 추천 시스템' },
  {
    date: '2019~23',
    title: '교육 멘토링 9회',
    note: 'KT 랜선야학, The가꿈, 아인슈타인 클래스, 대학생 재능봉사 캠프 등에서 학습과 진로를 함께 고민',
  },
];
