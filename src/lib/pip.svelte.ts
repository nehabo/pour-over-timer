import { mount, unmount } from 'svelte';
import MiniTimer from '../components/MiniTimer.svelte';

/** Minimal typing for the Document Picture-in-Picture API (not in TypeScript's DOM lib yet). */
interface DocumentPictureInPicture {
  requestWindow(options?: { width?: number; height?: number }): Promise<Window>;
  window: Window | null;
}

const dpip: DocumentPictureInPicture | undefined =
  typeof window !== 'undefined' && 'documentPictureInPicture' in window
    ? (window as unknown as { documentPictureInPicture: DocumentPictureInPicture }).documentPictureInPicture
    : undefined;

/** True in Chrome and Brave; the PiP button is hidden elsewhere. */
export const pipSupported = dpip !== undefined;

export const pip = $state({ open: false });

let pipWindow: Window | null = null;
let app: ReturnType<typeof mount> | null = null;

/** Copy every stylesheet into the PiP document so the mini view is styled. */
function copyStyles(target: Document) {
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const style = target.createElement('style');
      style.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join('\n');
      target.head.appendChild(style);
    } catch {
      // Cross-origin sheet: rules aren't readable, so link to it instead.
      if (sheet.href) {
        const link = target.createElement('link');
        link.rel = 'stylesheet';
        link.href = sheet.href;
        target.head.appendChild(link);
      }
    }
  }
}

/**
 * Open the PiP window, or close it if it's open.
 * Must be called straight from a click or key press: requestWindow needs a user gesture.
 */
export async function togglePip(): Promise<void> {
  if (!dpip) return;
  if (pipWindow) {
    pipWindow.close(); // pagehide below does the cleanup
    return;
  }

  let win: Window;
  try {
    win = await dpip.requestWindow({ width: 260, height: 160 });
  } catch (err) {
    console.warn('Could not open Picture-in-Picture window:', err);
    return;
  }
  pipWindow = win;
  win.document.title = 'Focus Timer';
  copyStyles(win.document);

  // Same JS context as the main page, so MiniTimer reads the same timer store: no messaging needed.
  app = mount(MiniTimer, { target: win.document.body });
  pip.open = true;

  win.addEventListener(
    'pagehide',
    () => {
      if (app) void unmount(app);
      app = null;
      pipWindow = null;
      pip.open = false;
    },
    { once: true },
  );
}
