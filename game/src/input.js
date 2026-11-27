// Gobble Dash — keyboard and mouse input, read once per fixed step.
// Keys: Space / ArrowUp / W jump · ArrowDown / S slide or hide · P pause
// · R restart · M mute. A mouse click (or tap) jumps; on-screen buttons
// are handled by main.js through the click position this module reports.

const JUMP_KEYS = new Set(['Space', 'ArrowUp', 'KeyW']);
const SLIDE_KEYS = new Set(['ArrowDown', 'KeyS']);
const PAUSE_KEYS = new Set(['KeyP', 'Escape']);
const RESTART_KEYS = new Set(['KeyR']);
const MUTE_KEYS = new Set(['KeyM']);
const START_KEYS = new Set(['Space', 'Enter', 'ArrowUp', 'KeyW']);

export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  let click = null;

  function onKeyDown(event) {
    if (JUMP_KEYS.has(event.code) || SLIDE_KEYS.has(event.code) || event.code === 'Space') {
      event.preventDefault();
    }
    if (!event.repeat) pressed.add(event.code);
    held.add(event.code);
  }

  function onKeyUp(event) {
    held.delete(event.code);
  }

  function onPointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    click = {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
    pressed.add('Pointer');
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  return {
    /** Snapshot of this step's fresh presses; call once per step. */
    poll() {
      const snapshot = {
        jump: [...pressed].some((c) => JUMP_KEYS.has(c) || c === 'Pointer'),
        slideHeld: [...held].some((c) => SLIDE_KEYS.has(c)),
        slidePressed: [...pressed].some((c) => SLIDE_KEYS.has(c)),
        pause: [...pressed].some((c) => PAUSE_KEYS.has(c)),
        restart: [...pressed].some((c) => RESTART_KEYS.has(c)),
        mute: [...pressed].some((c) => MUTE_KEYS.has(c)),
        start: [...pressed].some((c) => START_KEYS.has(c) || c === 'Pointer'),
        click,
      };
      pressed.clear();
      click = null;
      return snapshot;
    },
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('pointerdown', onPointerDown);
    },
  };
}
