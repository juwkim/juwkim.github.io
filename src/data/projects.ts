// 직접 만든 도구와 프로젝트. 홈의 What I Made 레일과 /projects/ 페이지에 함께 쓰입니다.
// 웹 체험 데모가 준비되면 links에 추가하고 statusLabel을 바꾸면 됩니다.

export interface ProjectLink {
  label: string;
  href: string;
  /** 외부 사이트 링크면 true (새 창 + ↗ 표시) */
  external?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  /** 분야 (예: AI · MAICON) */
  category: string;
  period: string;
  /** 상태 배지 문구 (예: 데모 준비 중) */
  statusLabel: string;
  /** 홈 카드용 한두 줄 요약 */
  summary: string;
  /** /projects/ 페이지용 설명 */
  description: string;
  highlights: string[];
  tags: string[];
  links: ProjectLink[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'drive2model-cross-labeling',
    title: 'Drive2Model Cross-Labeler',
    category: 'AI · MAICON',
    period: '2026.11',
    statusLabel: '데모 준비 중',
    summary:
      '국방 AI 경진대회(MAICON)에서 주행 영상과 시뮬레이션 데이터를 빠르게 검수·교차 라벨링하기 위해 직접 만든 도구입니다.',
    description:
      '국방 AI 경진대회(MAICON) 본선에서 스페이스뱅크 대표상을 받은 피지컬A100 팀의 핵심 데이터 파이프라인을 위해 직접 제작한 교차 라벨링 도구입니다. 시뮬레이션과 현장 데이터 사이의 간극을 줄이기 위해 설계 배경과 구조를 블로그에 정리해 두었고, 웹에서 바로 체험할 수 있는 데모도 준비 중입니다.',
    highlights: [
      '시뮬레이션·실환경 주행 데이터 교차 라벨링 워크플로 설계',
      '국방 AI 경진대회(MAICON) 본선 스페이스뱅크 대표상 수상',
      '웹 체험 데모 추가 예정',
    ],
    tags: ['AI', 'Computer Vision', 'Labeling Tool', 'MAICON'],
    links: [
      { label: '설계 글', href: '/cs/ai/drive2model-cross-labeling/' },
      { label: '본선 후기', href: '/cs/ai/maicon-2026-finals-review/' },
    ],
  },
  {
    slug: '42-cursus',
    title: '42서울 Cursus',
    category: 'System · C/C++',
    period: '2022.09 - 2024.09',
    statusLabel: '활동 기록',
    summary: '42서울 7기 본과정을 수료하며 C, Unix, 운영체제, 그래픽스 과제를 바닥부터 직접 구현한 2년간의 기록입니다.',
    description:
      '교수나 교재 없이 동료 평가만으로 문제를 해결하는 42서울 7기 본과정을 수료했습니다. 메모리 관리, 프로세스·스레드, 셸, 네트워크, 그래픽스까지 주요 시스템 과제를 직접 설계하고 구현한 결과물을 GitHub에 모아 두고 있습니다.',
    highlights: [
      '42서울 7기 본과정 수료 (2년)',
      'C/C++ 기반 Unix·OS·네트워크·그래픽스 직접 구현',
      '대표 과제별 상세 소개 및 체험 자료 순차 보강 예정',
    ],
    tags: ['C', 'C++', 'Unix', 'OS', '42Seoul'],
    links: [{ label: 'GitHub', href: 'https://github.com/juwkim', external: true }],
  },
  {
    slug: 'boj-9174',
    title: '백준 9,174문제',
    category: 'Algorithm',
    period: '꾸준히',
    statusLabel: '지속 기록',
    summary: '문제를 풀고 전략과 회고를 기록으로 남기며 쌓아 온 알고리즘 문제 해결 아카이브입니다.',
    description:
      '2025·2026 SCPC 2년 연속 본선 진출, PCCP Lv.4 취득과 함께 꾸준히 자료구조·알고리즘 문제를 해결해 왔습니다. solved.ac 프로필에서 전체 풀이 기록을 볼 수 있고, 대회 후기와 핵심 풀이법은 블로그 알고리즘 카테고리에 정리하고 있습니다.',
    highlights: [
      '백준 9,174문제 해결 (2026.11 기준)',
      'SCPC 2025·2026 2년 연속 본선 진출',
      'PCCP Lv.4 취득 및 대회 후기 아카이브 운영',
    ],
    tags: ['Algorithm', 'Problem Solving', 'BOJ', 'SCPC'],
    links: [
      { label: 'solved.ac', href: 'https://solved.ac/ko/u/faang12594', external: true },
      { label: '알고리즘 글', href: '/cs/algorithm/' },
    ],
  },
];
