// 글 본문(Markdown)의 링크를 새 창(새 탭)으로 열리게 하는 rehype 플러그인
// - 같은 글 안의 이동(#소제목, 각주)과 mailto:/tel: 링크는 그대로 둠
// - 새 창 링크에는 rel="noopener noreferrer"를 붙여 원래 탭을 보호함
// 빌드할 때 HTML에 미리 반영되므로 방문자 쪽 JS가 필요 없음

const SKIP = /^(#|mailto:|tel:|javascript:)/i;

/** @param {any} node */
function visit(node) {
  if (node.type === 'element' && node.tagName === 'a') {
    const props = node.properties || (node.properties = {});
    const href = typeof props.href === 'string' ? props.href.trim() : '';
    if (href && !SKIP.test(href)) {
      props.target = '_blank';
      const rel = new Set(Array.isArray(props.rel) ? props.rel : String(props.rel || '').split(/\s+/).filter(Boolean));
      rel.add('noopener');
      rel.add('noreferrer');
      props.rel = [...rel];
    }
  }
  // 원고에 직접 쓴 HTML(<a href="...">)은 raw 노드로 남으므로 문자열에서 처리
  if (node.type === 'raw' && typeof node.value === 'string') {
    node.value = node.value.replace(/<a\s([^>]*)>/gi, (tag, attrs) => {
      const href = (attrs.match(/href\s*=\s*["']([^"']*)["']/i) || [])[1] || '';
      if (!href || SKIP.test(href.trim()) || /\btarget\s*=/i.test(attrs)) return tag;
      const relAttr = /\brel\s*=/i.test(attrs) ? '' : ' rel="noopener noreferrer"';
      return `<a ${attrs.trim()} target="_blank"${relAttr}>`;
    });
  }
  if (Array.isArray(node.children)) node.children.forEach(visit);
}

export default function rehypeLinkTarget() {
  return (/** @type {any} */ tree) => visit(tree);
}
