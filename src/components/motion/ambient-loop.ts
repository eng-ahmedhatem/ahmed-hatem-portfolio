/** Always yield to the browser, even when an animation completes immediately. */
export function startAmbientLoop(step: () => number) {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  function tick() {
    if (stopped) return;
    const duration = step();
    if (!stopped) timer = setTimeout(tick, Math.max(1000, Number.isFinite(duration) ? duration : 1000));
  }
  tick();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
