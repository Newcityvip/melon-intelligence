import { test, expect } from "@playwright/test";
import {
  brands,
  m1,
  yesterday,
  delta,
  sumMetrics,
  series,
  signalWeights,
  metricsFor,
} from "../src/data/demo";
test("financial comparisons and chart totals reconcile", () => {
  expect(delta(m1.deposit, yesterday.deposit)).toBeCloseTo(7.526, 2);
  expect(delta(m1.withdrawal, yesterday.withdrawal)).toBeCloseTo(-12.474, 2);
  expect(m1.deposit - m1.withdrawal).toBeCloseTo(32784494.91, 2);
  expect((m1.wl / m1.turnover) * 100).toBeCloseTo(2.11, 2);
  expect(signalWeights.reduce((a, b) => a + b, 0)).toBe(87);
  for (const period of ["Today", "7 Days", "30 Days"] as const) {
    const total = sumMetrics(brands.map((b) => metricsFor(b, period)));
    const chart = series(total, period);
    for (const key of ["deposit", "withdrawal", "wl", "turnover"] as const)
      expect(chart.reduce((s, p) => s + p[key], 0)).toBeCloseTo(total[key], 2);
  }
});
