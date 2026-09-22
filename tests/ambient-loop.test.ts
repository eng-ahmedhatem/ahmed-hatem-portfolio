import assert from "node:assert/strict";
import { test } from "node:test";
import { startAmbientLoop } from "../src/components/motion/ambient-loop";

test("ambient movement yields even if Motion completes immediately, and cleans up", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  const stop = startAmbientLoop(() => { calls += 1; return 3300; });
  await Promise.resolve();
  await Promise.resolve();
  assert.equal(calls, 1, "no unbounded microtask animation loop");
  t.mock.timers.tick(3299);
  assert.equal(calls, 1);
  t.mock.timers.tick(1);
  assert.equal(calls, 2);
  stop();
  t.mock.timers.tick(20000);
  assert.equal(calls, 2, "unmount/hidden cleanup cancels future movement");
});

test("ambient movement has a minimum delay for invalid or zero durations", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let calls = 0;
  const stop = startAmbientLoop(() => { calls += 1; return calls === 1 ? 0 : NaN; });
  t.mock.timers.tick(999);
  assert.equal(calls, 1);
  t.mock.timers.tick(1);
  assert.equal(calls, 2);
  t.mock.timers.tick(999);
  assert.equal(calls, 2);
  stop();
});
