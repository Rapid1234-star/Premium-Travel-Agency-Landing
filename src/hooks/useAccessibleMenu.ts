import { useCallback, useEffect, useRef } from 'react';

/** Focus trap + Escape + restore focus for fullscreen menus. */
export function useAccessibleMenu(open: boolean, setOpen: (v: boolean) => void) {
  const menuRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const openMenu = useCallback((from?: HTMLElement | null) => {
    openerRef.current = from ?? (document.activeElement as HTMLElement | null);
    setOpen(true);
  }, [setOpen]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    // Restore focus after paint
    requestAnimationFrame(() => {
      openerRef.current?.focus?.();
    });
  }, [setOpen]);

  useEffect(() => {
    const node = menuRef.current;
    if (!node) return;

    if (open) {
      node.removeAttribute('inert');
      node.setAttribute('aria-hidden', 'false');
      const focusable = node.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    } else {
      node.setAttribute('inert', '');
      node.setAttribute('aria-hidden', 'true');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return;
      }
      if (e.key !== 'Tab' || !menuRef.current) return;

      const focusables = [
        ...menuRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ),
      ].filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeMenu]);

  return { menuRef, openMenu, closeMenu };
}
