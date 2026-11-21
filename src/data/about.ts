// About 페이지 내용. 여기만 고치면 About 페이지에 반영됩니다.
// ⚠️ now, steps의 내용은 아직 예시입니다 → docs/discussion-backlog.md 참고

export const profile = {
  name: '김주원',
  // 한 줄 = 화면의 한 줄 (넓은 화면 기준)
  tagline: ['큰 꿈을 품고, 오늘도 작은 한 걸음을 내딛습니다.', '가끔은 신나서 뛰다가 넘어지기도 하지만요.'],
  avatar: '주', // 사진을 쓰려면 나중에 이미지로 교체
};

/** 아직 남은 꿈 — 이루면 done: true (빈 원 → 채운 원) */
export const dreams = [
  {
    title: '매일 달라지는 방향 속에서, 지금 가장 알맞은 한 걸음을 고민하기',
    why: '정답보다 방향을 먼저 묻는 습관',
    done: false,
  },
  { title: '운동은 하루도 거르지 않기', why: '꿈을 오래 지고 갈 몸 만들기', done: false },
  { title: '영어와 더 가까워지기', why: '읽고, 듣고, 말하는 데 막힘이 없을 때까지', done: false },
  { title: '함께 나아갈 동반자를 적극적으로 찾기', why: '멀리 가려면 함께 가야 하니까', done: false },
];

/** 요즘의 나 — 한 달에 한 번쯤 업데이트 */
export const now = {
  updated: '2026년 11월',
  items: [
    { label: '공부', text: '정보처리기사를 마치고, 다음에 도전할 것을 고르는 중' },
    { label: '고민', text: '불확실한 길 위에서 몰입하는 사람들은 무엇이 다를까' },
    { label: '습관', text: '아침 운동 루틴 다시 붙이기' },
    { label: '빠져 있는 것', text: 'AI가 바꿔 갈 사회와 일의 모습' },
  ],
};

/** 지나온 발걸음 — 최신이 위로. link는 관련 글 주소(선택) */
export const steps: { date: string; title: string; note: string; link?: string }[] = [
  { date: '2026.11', title: '정보처리기사', note: 'CS를 처음부터 다시 훑어본 시간.' },
  { date: '2026.10', title: '한국사능력검정시험 심화 3급', note: '시험 전날 4시간의 벼락치기, 그래도 해냈다.' },
  { date: '2026.10', title: '지게차운전기능사', note: '책상 밖에서 배운 첫 기술.' },
  { date: '2022.11', title: '산업통상자원부 장관상', note: '창의적 종합설계 경진대회 · 팀과 함께 끝까지 간 첫 경험' },
  { date: '2022.09', title: '성균관대 창의적 종합설계 경진대회 대상', note: '밤새 만든 것이 처음으로 인정받은 날' },
];
