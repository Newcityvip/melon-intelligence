export type Health = "Healthy" | "Watch" | "High Risk";
export type CaseStatus =
  "New" | "Investigating" | "Reviewed" | "Escalated" | "Cleared";
export type Period = "Today" | "7 Days" | "30 Days";
export const meta = {
  demo: true,
  source: "Synthetic demonstration dataset",
  date: "22 Sep 2026",
  currency: "BDT",
} as const;
export interface Metrics {
  deposit: number;
  withdrawal: number;
  registered: number;
  first: number;
  active: number;
  turnover: number;
  wl: number;
  bonus: number;
  depositCount: number;
  withdrawalCount: number;
}
export interface Brand {
  id: string;
  name: string;
  health: Health;
  today: Metrics;
  previous: Metrics;
}
export const m1: Metrics = {
  deposit: 164577430.52,
  withdrawal: 131792935.61,
  registered: 1225,
  first: 677,
  active: 42816,
  turnover: 1567000000,
  wl: 33090000,
  bonus: 2480000,
  depositCount: 81140,
  withdrawalCount: 25274,
};
export const yesterday: Metrics = {
  deposit: 153057046.14,
  withdrawal: 150578950.11,
  registered: 1486,
  first: 747,
  active: 41230,
  turnover: 1607000000,
  wl: 40940000,
  bonus: 2310000,
  depositCount: 80147,
  withdrawalCount: 29555,
};
const scale = (m: Metrics, n: number): Metrics =>
  Object.fromEntries(
    Object.entries(m).map(([k, v]) => [
      k,
      [
        "registered",
        "first",
        "active",
        "depositCount",
        "withdrawalCount",
      ].includes(k)
        ? Math.round(v * n)
        : v * n,
    ]),
  ) as unknown as Metrics;
export const brands: Brand[] = Array.from({ length: 10 }, (_, i) => ({
  id: `M${i + 1}`,
  name: i === 0 ? "MCW" : `MELON ${i + 1}`,
  health: i === 6 ? "High Risk" : i === 3 || i === 8 ? "Watch" : "Healthy",
  today:
    i === 0
      ? m1
      : scale(m1, [1, 0.68, 0.57, 0.46, 0.41, 0.35, 0.3, 0.25, 0.22, 0.17][i]),
  previous:
    i === 0
      ? yesterday
      : scale(
          yesterday,
          [1, 0.64, 0.59, 0.5, 0.4, 0.33, 0.36, 0.24, 0.25, 0.16][i],
        ),
}));
export function metricsFor(b: Brand, p: Period, previous = false): Metrics {
  const base = previous ? b.previous : b.today;
  return scale(
    base,
    p === "Today"
      ? 1
      : p === "7 Days"
        ? previous
          ? 6.74
          : 6.89
        : previous
          ? 28.2
          : 29.1,
  );
}
export const sumMetrics = (list: Metrics[]): Metrics =>
  list.reduce(
    (a, b) =>
      Object.fromEntries(
        Object.keys(a).map((k) => [
          k,
          a[k as keyof Metrics] + b[k as keyof Metrics],
        ]),
      ) as unknown as Metrics,
    scale(m1, 0),
  );
export const delta = (a: number, b: number) =>
  b === 0 ? 0 : ((a - b) / Math.abs(b)) * 100;
export const money = (n: number, full = false) =>
  full
    ? `BDT ${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`
    : `${n < 0 ? "−" : ""}৳${Math.abs(n) >= 1e9 ? (Math.abs(n) / 1e9).toFixed(2) + "B" : Math.abs(n) >= 1e6 ? (Math.abs(n) / 1e6).toFixed(2) + "M" : Math.abs(n) >= 1000 ? (Math.abs(n) / 1000).toFixed(0) + "K" : Math.abs(n).toFixed(0)}`;
export const num = (n: number) => Math.round(n).toLocaleString("en-US");
export function series(m: Metrics, p: Period = "Today") {
  const count = p === "Today" ? 12 : p === "7 Days" ? 7 : 15;
  const weights = Array.from(
    { length: count },
    (_, i) => 0.7 + (i % 4) * 0.13 + i * 0.026,
  );
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w, i) => ({
    time:
      p === "Today"
        ? `${String(i * 2).padStart(2, "0")}:00`
        : new Date(
            Date.UTC(2026, 8, 22 - (count - 1 - i) * (p === "30 Days" ? 2 : 1)),
          ).toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    deposit: (m.deposit * w) / sum,
    withdrawal: (m.withdrawal * weights[count - i - 1]) / sum,
    wl: (m.wl * w) / sum,
    turnover: (m.turnover * w) / sum,
    margin: (m.wl / m.turnover) * 100 + Math.sin(i) * 0.2,
    registered: Math.round((m.registered * w) / sum),
    first: Math.round((m.first * w) / sum),
    bets: Math.round(180 * w),
  }));
}
export interface Vendor {
  name: string;
  type: string;
  players: number;
  bets: number;
  stake: number;
  wl: number;
  baseline: number;
  risk: Health;
  game: string;
}
export const vendors: Vendor[] = [
  "JILI",
  "FC",
  "JDB",
  "PP",
  "WorldMatch",
  "CRICKET / Exchange",
  "BTG",
  "PLAY8",
  "KA",
  "CQ9",
  "RELAX",
  "NETENT",
  "OCTOPLAY",
].map((name, i) => ({
  name,
  type: i === 5 ? "Sports / Exchange" : "Slots",
  players: 4210 - i * 237,
  bets: 184320 - i * 11230,
  stake: 125400000 - i * 6200000,
  wl: i === 0 ? -307000 : i === 4 ? -182000 : 3800000 - i * 180000,
  baseline: 2.8 + (i % 3) * 0.2,
  risk: i === 0 ? "High Risk" : i === 4 ? "Watch" : "Healthy",
  game: [
    "Fortune Gems",
    "Golden Empire",
    "Dragon Treasure",
    "Gates of Olympus",
    "Wild Fortune",
  ][i % 5],
}));
export interface RiskCase {
  id: string;
  brand: string;
  player: string;
  type: string;
  score: number;
  severity: "High" | "Medium" | "Low";
  signals: string[];
  time: string;
  status: CaseStatus;
  amount: number;
  age: number;
  vip: string;
  method: string;
  recentDeposit: number;
  turnover: number;
  vendor: string;
}
export const cases: RiskCase[] = [
  {
    id: "MI-2048",
    brand: "M1",
    player: "demo_player_4821",
    type: "Abnormal withdrawal pattern",
    score: 87,
    severity: "High",
    signals: [
      "Withdrawal disproportionate to recent deposits",
      "High winnings concentrated in one game",
      "Account behavior outside historical baseline",
      "Rapid withdrawal after significant win",
      "Vendor currently under anomaly watch",
      "Device/access anomaly",
    ],
    time: "14:42",
    status: "New",
    amount: 450000,
    age: 18,
    vip: "VIP 3",
    method: "Demo mobile wallet",
    recentDeposit: 25000,
    turnover: 820000,
    vendor: "JILI",
  },
  {
    id: "MI-2047",
    brand: "M7",
    player: "demo_player_7310",
    type: "Vendor loss concentration",
    score: 78,
    severity: "High",
    signals: [
      "Winnings concentrated in one vendor",
      "Withdrawal velocity above baseline",
    ],
    time: "14:38",
    status: "Investigating",
    amount: 680000,
    age: 92,
    vip: "VIP 5",
    method: "Demo bank transfer",
    recentDeposit: 180000,
    turnover: 2100000,
    vendor: "WorldMatch",
  },
  {
    id: "MI-2046",
    brand: "M4",
    player: "demo_player_2105",
    type: "New-account withdrawal velocity",
    score: 64,
    severity: "Medium",
    signals: ["New account", "Rapid deposit-to-withdrawal"],
    time: "14:31",
    status: "New",
    amount: 180000,
    age: 2,
    vip: "VIP 1",
    method: "Demo mobile wallet",
    recentDeposit: 60000,
    turnover: 190000,
    vendor: "FC",
  },
  {
    id: "MI-2045",
    brand: "M1",
    player: "demo_player_6902",
    type: "Recent large game win",
    score: 48,
    severity: "Medium",
    signals: ["Single-game win outside player baseline"],
    time: "14:24",
    status: "Reviewed",
    amount: 320000,
    age: 240,
    vip: "VIP 4",
    method: "Demo bank transfer",
    recentDeposit: 150000,
    turnover: 2400000,
    vendor: "PP",
  },
  {
    id: "MI-2044",
    brand: "M9",
    player: "demo_player_1038",
    type: "Routine withdrawal review",
    score: 22,
    severity: "Low",
    signals: ["Routine sampled review; no elevated correlation"],
    time: "14:18",
    status: "Cleared",
    amount: 42000,
    age: 380,
    vip: "VIP 2",
    method: "Demo mobile wallet",
    recentDeposit: 50000,
    turnover: 480000,
    vendor: "JDB",
  },
  {
    id: "MI-2043",
    brand: "M2",
    player: "demo_player_5501",
    type: "Withdrawal amount review",
    score: 35,
    severity: "Low",
    signals: ["Amount exceeds routine review threshold"],
    time: "14:12",
    status: "New",
    amount: 125000,
    age: 145,
    vip: "VIP 2",
    method: "Demo bank transfer",
    recentDeposit: 100000,
    turnover: 980000,
    vendor: "CQ9",
  },
];
export const signalWeights = [25, 20, 15, 12, 10, 5];
export const prompts = [
  "Why is margin down today?",
  "Which brand needs attention?",
  "Which vendors are outside normal behavior?",
  "Summarize high-risk withdrawals.",
  "Compare M1 with yesterday.",
];
export const answers = [
  "M1 company margin moved from 2.55% to 2.11% (−0.44 percentage points). Company win/loss declined 19.2% while turnover declined 2.5%. JILI and WorldMatch have negative simulated contributions. Review game mix and concentrated wins before drawing conclusions; short-term variance is expected.",
  "M7 has the highest investigation priority, with deposits below its comparison period and a concentrated vendor result. M4 and M9 are on watch. M1 remains healthy overall, with specific player and vendor signals to review.",
  "JILI is at −BDT 307K company W/L and WorldMatch at −BDT 182K. Both are outside their positive demo baselines. Compare historical distributions, game mix and player concentration. Negative results alone do not establish fraud.",
  "Two simulated withdrawals have high investigation priority: demo_player_4821 (BDT 450,000; score 87) and demo_player_7310 (BDT 680,000; score 78). Review recent deposits, betting history and vendor correlations. An analyst must make any decision.",
  "M1 deposits grew 7.5% to BDT 164.58M; withdrawals fell 12.5% to BDT 131.79M. Net flow improved to BDT 32.78M. Registrations fell 17.6%, while first depositors fell 9.4%. First-depositor / registration ratio rose from 50.3% to 55.3%; this is a same-day ratio, not a cohort conversion rate.",
];
export const businessAlerts = [
  {
    title: "Margin deterioration",
    brand: "M1",
    detail: "Gross margin eased from 2.55% to 2.11%. Review mix and variance.",
    severity: "Medium",
  },
  {
    title: "Deposit decline",
    brand: "M7",
    detail:
      "Deposits below the comparison baseline. Review channel performance.",
    severity: "Medium",
  },
  {
    title: "Vendor abnormal loss",
    brand: "M1",
    detail: "JILI company result is −BDT 307K. Statistical review recommended.",
    severity: "High",
  },
  {
    title: "Withdrawal spike",
    brand: "M4",
    detail: "New-account withdrawal velocity above simulated baseline.",
    severity: "Medium",
  },
];
export const playerDetails = {
  registered: "04 Sep 2026",
  lastLogin: "Today, 14:36",
  lastDeposit: "Today, 12:18",
  lastBet: "Today, 14:39",
  balance: 482600,
  channel: "Organic / mobile",
  affiliate: "Demo affiliate A12",
  lifetimeDeposit: 325000,
  lifetimeWithdrawal: 180000,
  turnover: 4860000,
  wl: 337600,
  bonus: 18000,
  devices: 3,
  ipChanges: 4,
};
export const pipeline = [
  "10 MELON BOs",
  "Collector / Zeusflow",
  "PostgreSQL",
  "Analytics Engine",
  "Risk Engine",
  "AI Agent",
  "Dashboard",
  "Telegram",
];
export const demoConfig = {
  largeWithdrawal: 300000,
  newAccountDays: 30,
  highPriority: 75,
  topConcentration: [42, 19, 11],
  exposure: [0.72, 0.18, 0.1],
  exposureResult: [0.84, 0.12, 0.04],
};
export const recentBets = Array.from({ length: 5 }, (_, i) => ({
  time: `14:${39 - i * 3}`,
  bet: 5000 + i * 1200,
  wl: i % 2 ? -6200 : 87000 - i * 8500,
  status: "Settled",
}));
export const connectionStats = brands.map((b, i) => ({
  brand: b.id,
  latency: 120 + i * 17,
  records: 192480 - i * 12310,
}));
export function vendorHistory(v: Vendor) {
  return Array.from({ length: 7 }, (_, i) => ({
    time: i === 6 ? "Today" : `${16 + i} Sep`,
    wl: i === 6 ? v.wl : (v.stake * (v.baseline + Math.sin(i) * 0.4)) / 100,
  }));
}
export function financialProfile(c: RiskCase) {
  return {
    "Lifetime Deposit":
      c.id === "MI-2048" ? playerDetails.lifetimeDeposit : c.recentDeposit * 8,
    "Lifetime Withdrawal":
      c.id === "MI-2048" ? playerDetails.lifetimeWithdrawal : c.amount * 2,
    Turnover: c.id === "MI-2048" ? playerDetails.turnover : c.turnover,
    "Player Win/Loss": c.id === "MI-2048" ? playerDetails.wl : c.amount * 0.6,
    Bonus: playerDetails.bonus,
    "Current Balance":
      c.id === "MI-2048" ? playerDetails.balance : c.amount * 1.05,
  };
}
