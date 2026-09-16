/**
 * Scroll a section into view inside Drei ScrollControls' HTML scroller
 * (not document/window — App shell is overflow:hidden).
 */
export function scrollDreiToId(id: string, scroller: HTMLElement | null | undefined) {
  const target = document.getElementById(id);
  if (!target) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth';

  if (scroller) {
    const parentRect = scroller.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const nextTop = scroller.scrollTop + (targetRect.top - parentRect.top);
    scroller.scrollTo({ top: Math.max(0, nextTop), behavior });
    return;
  }

  // Fallback (Static / native document scroll)
  target.scrollIntoView({ behavior, block: 'start' });
}
