import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bell,
  Building2,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  Cpu,
  Eye,
  Gauge,
  Globe,
  Layers3,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import { Badge, Panel, Chart, Kpi, Score } from "./components/ui";
import {
  demoConfig,
  recentBets,
  connectionStats,
  vendorHistory,
  financialProfile,
  answers,
  brands,
  businessAlerts,
  cases as initialCases,
  delta,
  meta,
  metricsFor,
  money,
  num,
  pipeline,
  playerDetails,
  prompts,
  series,
  signalWeights,
  sumMetrics,
  vendors,
} from "./data/demo";
import type {
  Brand,
  CaseStatus,
  Metrics,
  Period,
  RiskCase,
  Vendor,
} from "./data/demo";
const nav = [
  { name: "Command Center", icon: Gauge },
  { name: "Business Intelligence", icon: ChartNoAxesCombined },
  { name: "Brands", icon: Building2 },
  { name: "Vendor & Game Risk", icon: Layers3 },
  { name: "Withdrawal Monitor", icon: Wallet },
  { name: "Risk Center", icon: ShieldAlert },
  { name: "Player Investigation", icon: Search },
  { name: "AI Intelligence", icon: Sparkles },
  { name: "Alert Center", icon: Bell },
  { name: "System Monitor", icon: Cpu },
];
function App() {
  const [page, setPage] = useState(0),
    [period, setPeriod] = useState<Period>("Today"),
    [brand, setBrand] = useState<Brand>(brands[0]),
    [brandFilter, setBrandFilter] = useState("All"),
    [withdrawFilter, setWithdrawFilter] = useState("All"),
    [riskFilter, setRiskFilter] = useState("All");
  const [cases, setCases] = useState(initialCases),
    [selected, setSelected] = useState(initialCases[0]),
    [vendor, setVendor] = useState<Vendor | null>(null),
    [question, setQuestion] = useState(0),
    [query, setQuery] = useState(""),
    [lastRefresh, setLastRefresh] = useState("14:45:00"),
    [refreshing, setRefreshing] = useState(false),
    [toast, setToast] = useState(""),
    [mobile, setMobile] = useState(false),
    [generated, setGenerated] = useState<string[]>([]),
    [reviewedAlerts, setReviewedAlerts] = useState<string[]>([]);
  const go = (n: number) => {
    setPage(n);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const notify = (text: string) => setToast(text);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!vendor) return;
    const before = document.activeElement as HTMLElement;
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    const elements = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex="0"]',
        ),
      );
    elements()[0]?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVendor(null);
      if (e.key === "Tab") {
        const list = elements(),
          first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = previous;
      before?.focus();
    };
  }, [vendor]);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date().toLocaleTimeString("en-GB"));
      setRefreshing(false);
      notify("Simulated snapshot refreshed. No external connections.");
    }, 700);
  };
  const investigate = (c: RiskCase) => {
    setSelected(c);
    go(6);
  };
  const updateCase = (status: CaseStatus) => {
    setCases((old) =>
      old.map((c) => (c.id === selected.id ? { ...c, status } : c)),
    );
    setSelected((s) => ({ ...s, status }));
    notify(
      `${selected.id} marked ${status.toLowerCase()} in this demo session.`,
    );
  };
  const total = sumMetrics(brands.map((b) => metricsFor(b, period))),
    prior = sumMetrics(brands.map((b) => metricsFor(b, period, true))),
    m = metricsFor(brand, period),
    prev = metricsFor(brand, period, true),
    open = cases.filter((c) => !["Cleared", "Reviewed"].includes(c.status));
  const mainKpis = (a: Metrics, b: Metrics) => (
    <div className="kpis">
      <Kpi
        label="Total Deposit"
        value={money(a.deposit)}
        change={delta(a.deposit, b.deposit)}
      />
      <Kpi
        label="Total Withdrawal"
        value={money(a.withdrawal)}
        change={delta(a.withdrawal, b.withdrawal)}
        neutral
      />
      <Kpi
        label="Net Cash Flow"
        value={money(a.deposit - a.withdrawal)}
        change={delta(a.deposit - a.withdrawal, b.deposit - b.withdrawal)}
      />
      <Kpi
        label="Company Win/Loss"
        value={money(a.wl)}
        change={delta(a.wl, b.wl)}
      />
      <Kpi
        label="Active Players"
        value={num(a.active)}
        change={delta(a.active, b.active)}
      />
      <div className="kpi risk-kpi">
        <span className="kpi-label">
          Open Risk Alerts
          <ShieldAlert size={14} />
        </span>
        <strong>
          {open.length.toString().padStart(2, "0")}
          <Badge>Review required</Badge>
        </strong>
        <p>
          <i className="dot amber" />
          {open.filter((c) => c.severity === "High").length} high priority ·
          current queue
        </p>
      </div>
    </div>
  );
  const brandTable = (detailed = false) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {[
              "Brand",
              "Deposit",
              "Withdrawal",
              ...(detailed ? ["Net Flow", "Turnover"] : []),
              "Company W/L",
              ...(detailed ? ["Margin", "Players"] : []),
              "Growth",
              "Risk / Status",
              "",
            ].map((s, i) => (
              <th key={i}>{s}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {brands
            .filter(
              (b) =>
                !detailed || brandFilter === "All" || b.health === brandFilter,
            )
            .map((b) => {
              const a = metricsFor(b, period),
                p = metricsFor(b, period, true);
              return (
                <tr key={b.id}>
                  <td>
                    <button
                      className="brand-link"
                      onClick={() => {
                        setBrand(b);
                        go(1);
                      }}
                    >
                      <span
                        className={`brand-icon ${b.id === "M1" ? "primary" : ""}`}
                      >
                        {b.id}
                      </span>
                      <span>
                        <b>{b.id === "M1" ? "MCW" : b.name}</b>
                        <small>
                          {b.id === "M1"
                            ? "Primary brand"
                            : `Brand ${b.id.slice(1)}`}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td>{money(a.deposit)}</td>
                  <td>{money(a.withdrawal)}</td>
                  {detailed && (
                    <>
                      <td>{money(a.deposit - a.withdrawal)}</td>
                      <td>{money(a.turnover)}</td>
                    </>
                  )}
                  <td className="positive">{money(a.wl)}</td>
                  {detailed && (
                    <>
                      <td>{((a.wl / a.turnover) * 100).toFixed(2)}%</td>
                      <td>{num(a.active)}</td>
                    </>
                  )}
                  <td
                    className={a.deposit >= p.deposit ? "positive" : "negative"}
                  >
                    {delta(a.deposit, p.deposit) > 0 ? "+" : ""}
                    {delta(a.deposit, p.deposit).toFixed(1)}%
                  </td>
                  <td>
                    <Badge>{b.health}</Badge>
                  </td>
                  <td>
                    <button
                      aria-label={`Open ${b.id}`}
                      className="icon-button"
                      onClick={() => {
                        setBrand(b);
                        go(1);
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
  const filters = (
    items: string[],
    value: string,
    set: (v: string) => void,
  ) => (
    <div className="filters">
      {items.map((i) => (
        <button
          key={i}
          className={i === value ? "active" : ""}
          onClick={() => set(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );
  const riskDisclaimer = (
    <p className="disclaimer">
      <ShieldCheck size={16} />
      Risk scores represent investigation priority, not a fraud determination.
      All records and assessments are simulated.
    </p>
  );
  return (
    <div className="app">
      <aside className={mobile ? "sidebar visible" : "sidebar"}>
        <a
          className="logo"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            go(0);
          }}
        >
          <span className="logo-mark">
            <Layers3 size={23} />
          </span>
          <span>
            MELON<small>INTELLIGENCE</small>
          </span>
        </a>
        <div className="workspace-label">
          OPERATIONS WORKSPACE <Badge>DEMO</Badge>
        </div>
        <nav>
          {nav.map((n, i) => (
            <button
              key={n.name}
              className={page === i ? "selected" : ""}
              onClick={() => go(i)}
            >
              <n.icon size={18} />
              <span>{n.name}</span>
              {i === 5 && <em>{open.length}</em>}
              {i === 0 && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="connection">
            <i className="dot" />
            <b>10 Brands Connected</b>
            <span>Simulated connections</span>
            <div className="connection-bars">
              {brands.map((b) => (
                <i key={b.id} />
              ))}
            </div>
          </div>
          <div className="user">
            <div>OP</div>
            <span>
              Operations Director<small>Demo workspace</small>
            </span>
            <ShieldCheck size={16} />
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <button
              aria-label="Toggle navigation"
              className="icon-button mobile-menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span className="breadcrumb">
              Workspace <ChevronRight size={12} /> <b>{nav[page].name}</b>
            </span>
          </div>
          <div className="top-actions">
            <span className="live">
              <i className="dot" />
              Live Monitoring <small>SIMULATED</small>
            </span>
            <button
              className="notification icon-button"
              aria-label="Open notifications"
              onClick={() => go(8)}
            >
              <Bell size={18} />
              <i />
            </button>
            <span className="avatar">OP</span>
          </div>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                MELON INTELLIGENCE <span>/</span>{" "}
                {page === 0
                  ? "GLOBAL OVERVIEW"
                  : page === 1
                    ? `${brand.id} · ${brand.name}`
                    : "OPERATIONS & ANALYTICS"}
              </div>
              <h1>
                {page === 0
                  ? "Business & Risk Command Center"
                  : page === 6
                    ? "Player Investigation 360"
                    : nav[page].name}
              </h1>
              <p>
                {page === 0
                  ? "One clear view of performance. Every signal that matters."
                  : page === 6
                    ? "A complete operational view. Evidence before decisions."
                    : "Connected intelligence for informed operational decisions."}
              </p>
            </div>
            <div className="heading-actions">
              <span className="date">{meta.date}</span>
              <button className="button" onClick={refresh}>
                <RefreshCw size={14} className={refreshing ? "spin" : ""} />
                {refreshing ? "Refreshing" : "Refresh"}
              </button>
            </div>
          </div>
          <div className="scope-row">
            <div>
              <Globe size={14} />
              <b>
                {page === 1 ? `${brand.id} / ${brand.name}` : "All 10 brands"}
              </b>
              <span className="divider" />
              <span>BDT · Demo dataset</span>
            </div>
            {page <= 2 ? (
              filters(["Today", "7 Days", "30 Days"], period, (p) =>
                setPeriod(p as Period),
              )
            ) : (
              <span className="small-tag">Today · operational snapshot</span>
            )}
          </div>
          {page === 0 && (
            <>
              {mainKpis(total, prior)}
              <div className="overview-grid">
                <Panel
                  title="Business performance"
                  subtitle="Combined financial flow across all 10 brands"
                  action={<span className="small-tag">{period} · BDT</span>}
                >
                  <Chart data={series(total, period)} />
                  <div className="chart-summary">
                    <span>
                      <i className="dot" />
                      Positive net cash flow
                    </span>
                    <strong>
                      {money(total.deposit - total.withdrawal)}{" "}
                      <small>across the network</small>
                    </strong>
                  </div>
                </Panel>
                <section className="brief panel">
                  <div className="ai-symbol">
                    <Sparkles size={20} />
                  </div>
                  <div className="eyebrow">AI EXECUTIVE BRIEF</div>
                  <h2>
                    Growth is healthy.
                    <br />
                    Margin deserves attention.
                  </h2>
                  <p>
                    M1 deposit volume is <b>7.5% above yesterday</b> while
                    withdrawals are <b>12.5% lower</b>. Company margin has
                    softened from 2.55% to 2.11%.
                  </p>
                  <div className="brief-note">
                    <ShieldAlert size={17} />
                    <span>
                      Two vendor anomalies and three withdrawal cases warrant a
                      closer look.
                    </span>
                  </div>
                  <button className="text-button" onClick={() => go(7)}>
                    Explore intelligence <ArrowRight size={15} />
                  </button>
                  <small>AI-generated demo insight · M1 daily snapshot</small>
                </section>
              </div>
              <div className="bottom-grid">
                <Panel
                  title="10 brand health"
                  subtitle="Network performance at a glance"
                  action={
                    <button className="text-button" onClick={() => go(2)}>
                      View all brands <ArrowRight size={14} />
                    </button>
                  }
                >
                  {brandTable()}
                </Panel>
                <Panel
                  title="Live risk feed"
                  subtitle="Simulated signals · analyst review required"
                  action={<span className="pulse-ring" />}
                >
                  <div className="feed">
                    {[cases[0], cases[1], cases[2]].map((c) => (
                      <article key={c.id}>
                        <div className="feed-top">
                          <Badge>{c.severity}</Badge>
                          <span>
                            {c.time} · {c.brand}
                          </span>
                        </div>
                        <h3>{c.type}</h3>
                        <p>{c.signals[0]}. Review recommended.</p>
                        <button
                          className="text-button"
                          onClick={() => investigate(c)}
                        >
                          Investigate <ArrowRight size={14} />
                        </button>
                      </article>
                    ))}
                    <article>
                      <div className="feed-top">
                        <Badge>Medium</Badge>
                        <span>14:20 · M1</span>
                      </div>
                      <h3>Margin deterioration</h3>
                      <p>Company margin below yesterday’s level.</p>
                      <button
                        className="text-button"
                        onClick={() => {
                          setBrand(brands[0]);
                          go(1);
                        }}
                      >
                        View analytics <ArrowRight size={14} />
                      </button>
                    </article>
                  </div>
                </Panel>
              </div>
            </>
          )}
          {page === 1 && (
            <>
              <div className="section-note">
                <ChartNoAxesCombined size={18} />
                {period === "Today"
                  ? "Today vs Yesterday"
                  : period === "7 Days"
                    ? "This Week vs Last Week"
                    : "This Month vs Last Month"}
                <span>
                  Historical periods are synthetic aggregate snapshots.
                </span>
              </div>
              {mainKpis(m, prev)}
              <div className="kpis business-extra">
                {(
                  [
                    { label: "Registered Users", key: "registered" },
                    { label: "First Depositors", key: "first" },
                    { label: "Turnover", key: "turnover" },
                    { label: "Bonus", key: "bonus" },
                  ] as const
                ).map((x) => (
                  <Kpi
                    key={x.key}
                    label={x.label}
                    value={
                      x.key === "turnover" || x.key === "bonus"
                        ? money(m[x.key])
                        : num(m[x.key])
                    }
                    change={delta(m[x.key], prev[x.key])}
                  />
                ))}
                <Kpi
                  label="Gross Margin"
                  value={`${((m.wl / m.turnover) * 100).toFixed(2)}%`}
                  change={delta(m.wl / m.turnover, prev.wl / prev.turnover)}
                />
              </div>
              <div className="two-grid">
                <Panel
                  title="Deposit vs withdrawal"
                  subtitle={`${num(m.depositCount)} deposits · ${num(m.withdrawalCount)} withdrawals`}
                >
                  <Chart
                    data={series(m, period)}
                    keys={["deposit", "withdrawal"]}
                  />
                </Panel>
                <Panel title="Turnover" subtitle="Total simulated stakes">
                  <Chart data={series(m, period)} keys={["turnover"]} bar />
                </Panel>
                <Panel title="Company win/loss">
                  <Chart data={series(m, period)} keys={["wl"]} />
                </Panel>
                <Panel title="Gross margin">
                  <Chart data={series(m, period)} keys={["margin"]} />
                </Panel>
                <Panel title="Acquisition & first depositors">
                  <Chart
                    data={series(m, period)}
                    keys={["registered", "first"]}
                    bar
                  />
                </Panel>
                <Panel
                  title="AI Business Analyst"
                  subtitle="Predefined demo analysis"
                >
                  <div className="analyst-copy">
                    <Sparkles />
                    <h3>Cash flow is strengthening</h3>
                    <p>
                      Deposits changed{" "}
                      {delta(m.deposit, prev.deposit).toFixed(1)}%; withdrawals
                      changed {delta(m.withdrawal, prev.withdrawal).toFixed(1)}%
                      against the selected comparison.
                    </p>
                    <p>
                      Margin is {((m.wl / m.turnover) * 100).toFixed(2)}%,
                      versus {((prev.wl / prev.turnover) * 100).toFixed(2)}%.
                      Review game mix and vendor contribution.
                    </p>
                    <p>
                      First-depositor / registration ratio:{" "}
                      {((m.first / m.registered) * 100).toFixed(1)}% vs{" "}
                      {((prev.first / prev.registered) * 100).toFixed(1)}%. This
                      is not cohort conversion.
                    </p>
                    <Badge>Manual review recommended</Badge>
                  </div>
                </Panel>
              </div>
            </>
          )}
          {page === 2 && (
            <>
              <div className="health-summary">
                <div>
                  <strong>10</strong>
                  <span>Monitored brands</span>
                </div>
                <div>
                  <strong className="positive">7</strong>
                  <span>Healthy</span>
                </div>
                <div>
                  <strong className="warning">2</strong>
                  <span>On watch</span>
                </div>
                <div>
                  <strong className="negative">1</strong>
                  <span>High risk</span>
                </div>
              </div>
              <Panel
                title="Brand comparison"
                subtitle="Select a brand to explore its business intelligence"
                action={filters(
                  ["All", "Healthy", "Watch", "High Risk"],
                  brandFilter,
                  setBrandFilter,
                )}
              >
                {brandTable(true)}
              </Panel>
            </>
          )}
          {page === 3 && (
            <>
              {riskDisclaimer}
              <div className="two-grid">
                <Panel
                  title="Vendor contribution"
                  subtitle="Current M1 company win/loss · BDT"
                >
                  <Chart
                    data={vendors.map((v) => ({ time: v.name, wl: v.wl }))}
                    keys={["wl"]}
                    bar
                  />
                </Panel>
                <Panel
                  title="Outside the expected range"
                  subtitle="Two vendors flagged for statistical review"
                >
                  <div className="anomaly-cards">
                    {vendors
                      .filter((v) => v.risk !== "Healthy")
                      .map((v) => (
                        <button key={v.name} onClick={() => setVendor(v)}>
                          <div>
                            <span className="vendor-logo">
                              {v.name.slice(0, 2)}
                            </span>
                            <b>{v.name}</b>
                            <Badge>{v.risk}</Badge>
                          </div>
                          <strong className="negative">{money(v.wl)}</strong>
                          <span>
                            Company W/L <ArrowRight size={15} />
                          </span>
                        </button>
                      ))}
                  </div>
                  <p className="disclaimer">
                    Statistical variance can produce short-term losses. Risk
                    status represents investigation priority, not a fraud
                    determination.
                  </p>
                </Panel>
              </div>
              <Panel
                title="Vendor & game surveillance"
                subtitle="Select any vendor to inspect players, concentration and historical performance"
              >
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Vendor / Game",
                          "Type",
                          "Players",
                          "Bets",
                          "Stake",
                          "Company W/L",
                          "Margin",
                          "Δ baseline",
                          "Risk",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.map((v) => (
                        <tr key={v.name}>
                          <td>
                            <button
                              className="table-link"
                              onClick={() => setVendor(v)}
                            >
                              {v.name}
                              <small>{v.game}</small>
                            </button>
                          </td>
                          <td>{v.type}</td>
                          <td>{num(v.players)}</td>
                          <td>{num(v.bets)}</td>
                          <td>{money(v.stake)}</td>
                          <td className={v.wl < 0 ? "negative" : "positive"}>
                            {money(v.wl)}
                          </td>
                          <td>{((v.wl / v.stake) * 100).toFixed(2)}%</td>
                          <td>
                            {((v.wl / v.stake) * 100 - v.baseline).toFixed(2)}{" "}
                            pp
                          </td>
                          <td>
                            <Badge>{v.risk}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            </>
          )}
          {page === 4 && (
            <>
              {riskDisclaimer}
              <Panel
                title="Withdrawal queue"
                subtitle="Fictional player records · current snapshot"
                action={filters(
                  [
                    "All",
                    "Pending",
                    "High Risk",
                    "Large Amount",
                    "New Account",
                  ],
                  withdrawFilter,
                  setWithdrawFilter,
                )}
              >
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Time / Brand",
                          "Username",
                          "VIP",
                          "Amount",
                          "Payment Method",
                          "Account Age",
                          "Recent Deposit",
                          "Turnover",
                          "Risk Score",
                          "Status",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cases
                        .filter(
                          (c) =>
                            withdrawFilter === "All" ||
                            (withdrawFilter === "Pending" &&
                              ["New", "Investigating"].includes(c.status)) ||
                            (withdrawFilter === "High Risk" &&
                              c.score >= demoConfig.highPriority) ||
                            (withdrawFilter === "Large Amount" &&
                              c.amount >= demoConfig.largeWithdrawal) ||
                            (withdrawFilter === "New Account" &&
                              c.age <= demoConfig.newAccountDays),
                        )
                        .map((c) => (
                          <tr key={c.id}>
                            <td>
                              {c.time}
                              <small>{c.brand}</small>
                            </td>
                            <td>
                              <button
                                className="table-link"
                                onClick={() => investigate(c)}
                              >
                                {c.player}
                              </button>
                            </td>
                            <td>{c.vip}</td>
                            <td>{money(c.amount)}</td>
                            <td>{c.method}</td>
                            <td>{c.age} days</td>
                            <td>{money(c.recentDeposit)}</td>
                            <td>{money(c.turnover)}</td>
                            <td>
                              <Score score={c.score} />
                            </td>
                            <td>
                              <Badge>{c.status}</Badge>
                              <small>
                                {c.score >= demoConfig.highPriority
                                  ? "High Priority"
                                  : c.score >= 45
                                    ? "Watch"
                                    : "Normal"}
                              </small>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <p className="disclaimer">
                Large amount ≥ BDT 300,000 · New account ≤ 30 days · High risk
                score ≥ 75. Review states do not process payments.
              </p>
            </>
          )}
          {page === 5 && (
            <>
              {riskDisclaimer}
              <Panel
                title="Investigation queue"
                subtitle="Explainable signals, coordinated review"
                action={filters(
                  ["All", "High", "Medium", "Low"],
                  riskFilter,
                  setRiskFilter,
                )}
              >
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Case / Brand",
                          "Player",
                          "Risk Type",
                          "Score",
                          "Severity",
                          "Signals",
                          "Detected",
                          "Status",
                          "Action",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cases
                        .filter(
                          (c) =>
                            riskFilter === "All" || c.severity === riskFilter,
                        )
                        .map((c) => (
                          <tr key={c.id}>
                            <td>
                              {c.id}
                              <small>{c.brand}</small>
                            </td>
                            <td>{c.player}</td>
                            <td>{c.type}</td>
                            <td>
                              <Score score={c.score} />
                            </td>
                            <td>
                              <Badge>{c.severity}</Badge>
                            </td>
                            <td>{c.signals.length} signals</td>
                            <td>{c.time}</td>
                            <td>
                              <Badge>{c.status}</Badge>
                            </td>
                            <td>
                              <button
                                className="text-button"
                                onClick={() => investigate(c)}
                              >
                                Review <ArrowRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <Panel
                title="Why this was flagged"
                subtitle="MI-2048 · explainable investigation priority"
              >
                <div className="signal-grid">
                  {initialCases[0].signals.map((s, i) => (
                    <div key={s}>
                      <span>+{signalWeights[i]}</span>
                      <p>{s}</p>
                    </div>
                  ))}
                </div>
                <p className="disclaimer">
                  Additive demonstration score: 87 / 100. Weights are
                  illustrative, uncalibrated, and not fraud probabilities.
                </p>
              </Panel>
            </>
          )}
          {page === 6 && (
            <>
              {riskDisclaimer}
              <div className="player-hero panel">
                <div className="player-avatar">{selected.player.slice(-2)}</div>
                <div>
                  <div className="eyebrow">
                    {selected.brand} {selected.brand === "M1" ? "/ MCW" : ""} ·{" "}
                    {selected.id}
                  </div>
                  <h2>{selected.player}</h2>
                  <p>
                    Fictional profile <span>•</span> {selected.vip}{" "}
                    <span>•</span> {selected.age} days old
                  </p>
                </div>
                <div className="player-priority">
                  <Badge>
                    {selected.score >= 75
                      ? "High priority review"
                      : selected.severity + " priority review"}
                  </Badge>
                  <Score score={selected.score} />
                  <Badge>{selected.status}</Badge>
                </div>
              </div>
              <div className="detail-grid">
                {Object.entries({
                  "Account age": `${selected.age} days`,
                  VIP: selected.vip,
                  "Registration date":
                    selected.id === "MI-2048"
                      ? playerDetails.registered
                      : new Date(
                          Date.UTC(2026, 8, 22 - selected.age),
                        ).toLocaleDateString("en-GB"),
                  "Last login": playerDetails.lastLogin,
                  "Last deposit": playerDetails.lastDeposit,
                  "Last bet": playerDetails.lastBet,
                  Channel: playerDetails.channel,
                  Affiliate: playerDetails.affiliate,
                }).map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className="kpis">
                {Object.entries(financialProfile(selected)).map(([k, v]) => (
                  <div className="kpi" key={k}>
                    <span className="kpi-label">{k}</span>
                    <strong>{money(v)}</strong>
                    <small>Fictional player data</small>
                  </div>
                ))}
              </div>
              <div className="three-grid">
                <Panel title="Deposit / withdrawal timeline">
                  <Chart
                    data={series({
                      ...m,
                      deposit: selected.recentDeposit,
                      withdrawal: selected.amount,
                    })}
                    keys={["deposit", "withdrawal"]}
                    height={190}
                  />
                </Panel>
                <Panel title="Betting activity">
                  <Chart data={series(m)} keys={["bets"]} height={190} bar />
                </Panel>
                <Panel title="Player win/loss timeline">
                  <Chart
                    wlLabel="Player W/L"
                    data={series({ ...m, wl: selected.amount * 0.6 })}
                    keys={["wl"]}
                    height={190}
                  />
                </Panel>
              </div>
              <div className="two-grid">
                <Panel
                  title="Vendor exposure"
                  subtitle="Player perspective · positive W/L represents player winnings"
                >
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Vendor</th>
                          <th>Stake</th>
                          <th>Player W/L</th>
                          <th>Activity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[selected.vendor, "PP", "JDB"].map((v, i) => (
                          <tr key={`${v}-${i}`}>
                            <td>{v}</td>
                            <td>
                              {money(
                                selected.turnover * demoConfig.exposure[i],
                              )}
                            </td>
                            <td className="positive">
                              {money(
                                selected.amount * demoConfig.exposureResult[i],
                              )}
                            </td>
                            <td>{demoConfig.exposure[i] * 100}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>
                <Panel
                  title="Device / access signals"
                  subtitle="Synthetic access metadata; no personal information"
                >
                  <div className="access-grid">
                    <div>
                      <strong>{playerDetails.devices}</strong>
                      <span>Device tokens</span>
                    </div>
                    <div>
                      <strong>{playerDetails.ipChanges}</strong>
                      <span>IP changes / 24h</span>
                    </div>
                    <div>
                      <Badge>Watch</Badge>
                      <span>Shared-signal indicator</span>
                    </div>
                  </div>
                  <p className="disclaimer">
                    A new device and increased session frequency preceded the
                    withdrawal. Shared signals may have benign explanations.
                  </p>
                </Panel>
              </div>
              <Panel
                title="Recent individual bets"
                subtitle="Illustrative settled game events"
              >
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {[
                          "Date / Time",
                          "Vendor",
                          "Game",
                          "Bet",
                          "Player Win/Loss",
                          "Status",
                        ].map((h) => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentBets.map((bet, i) => (
                        <tr key={i}>
                          <td>
                            {meta.date} · {bet.time}
                          </td>
                          <td>{selected.vendor}</td>
                          <td>
                            {
                              vendors.find((v) => v.name === selected.vendor)
                                ?.game
                            }
                          </td>
                          <td>{money(bet.bet)}</td>
                          <td className={bet.wl < 0 ? "negative" : "positive"}>
                            {money(bet.wl)}
                          </td>
                          <td>
                            <Badge>Settled</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
              <div className="two-grid">
                <Panel
                  title="Detected signals"
                  subtitle="Illustrative additive investigation score"
                >
                  <div className="signal-list">
                    {selected.signals.map((s, i) => (
                      <div key={s}>
                        <span>
                          +
                          {selected.id === "MI-2048"
                            ? signalWeights[i]
                            : Math.floor(
                                selected.score / selected.signals.length,
                              ) +
                              (i === 0
                                ? selected.score % selected.signals.length
                                : 0)}
                        </span>
                        <p>{s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="signal-total">
                    Investigation priority <b>{selected.score} / 100</b>
                  </div>
                </Panel>
                <Panel
                  title="AI Investigation Assessment"
                  subtitle="Prototype AI analysis · predefined response"
                >
                  <div className="analyst-copy">
                    <Sparkles />
                    <h3>
                      {selected.score >= 75
                        ? "Multiple independent anomalies are present."
                        : "Contextual review recommended."}
                    </h3>
                    <p>
                      The strongest signals include{" "}
                      {selected.signals.slice(0, 2).join(" and ").toLowerCase()}
                      . Review the financial timeline, game outcomes and
                      potential vendor correlation.
                    </p>
                    <p>
                      This does not establish fraudulent activity. Manual review
                      is recommended before processing.
                    </p>
                    <div className="action-grid">
                      <button
                        className="button"
                        onClick={() => updateCase("Reviewed")}
                      >
                        <Check size={15} />
                        Mark Reviewed
                      </button>
                      <button
                        className="button danger"
                        onClick={() => updateCase("Escalated")}
                      >
                        Escalate
                      </button>
                      <button
                        className="button"
                        onClick={() => updateCase("Cleared")}
                      >
                        <ShieldCheck size={15} />
                        Clear Case
                      </button>
                      <button
                        className="button primary-button"
                        onClick={() => {
                          setGenerated((g) =>
                            g.includes(selected.id) ? g : [...g, selected.id],
                          );
                          notify(
                            "Demo alert generated. Nothing sent externally.",
                          );
                          go(8);
                        }}
                      >
                        <Bell size={15} />
                        Generate Alert
                      </button>
                    </div>
                  </div>
                </Panel>
              </div>
            </>
          )}
          {page === 7 && (
            <>
              <div className="ai-banner">
                <div className="ai-symbol">
                  <Sparkles size={28} />
                </div>
                <div>
                  <Badge>Prototype AI Analysis</Badge>
                  <h2>Your operations, interpreted.</h2>
                  <p>
                    Explore monitored business and risk signals with a simulated
                    analyst.
                  </p>
                </div>
                <span className="small-tag">No AI API connected</span>
              </div>
              <div className="two-grid">
                <Panel
                  title="Operations analyst"
                  subtitle="Choose a question to explore a predefined demo response"
                >
                  <div className="prompt-list">
                    {prompts.map((p, i) => (
                      <button
                        className={question === i ? "active" : ""}
                        key={p}
                        onClick={() => setQuestion(i)}
                      >
                        <Sparkles size={15} />
                        {p}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  </div>
                  <form
                    className="ask-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const q = query.toLowerCase();
                      setQuestion(
                        q.includes("margin")
                          ? 0
                          : q.includes("brand")
                            ? 1
                            : q.includes("vendor")
                              ? 2
                              : q.includes("withdraw")
                                ? 3
                                : 4,
                      );
                      notify(
                        "Matched your question to a predefined demo topic.",
                      );
                      setQuery("");
                    }}
                  >
                    <input
                      aria-label="Ask demo analyst"
                      placeholder="Ask about margin, vendors, withdrawals…"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      required
                    />
                    <button
                      className="icon-button"
                      aria-label="Submit question"
                    >
                      <ArrowRight size={18} />
                    </button>
                  </form>
                </Panel>
                <Panel
                  title="Analyst response"
                  subtitle="M1 daily reference snapshot · scripted, not live AI"
                >
                  <div className="analyst-copy">
                    <div className="chat-question">{prompts[question]}</div>
                    <Sparkles />
                    <p className="ai-answer">{answers[question]}</p>
                    <div className="source-tags">
                      <span>M1 business metrics</span>
                      <span>Vendor snapshot</span>
                      <span>Review queue</span>
                    </div>
                    <button
                      className="text-button"
                      onClick={() =>
                        go(question === 2 ? 3 : question === 3 ? 4 : 1)
                      }
                    >
                      Explore supporting data <ArrowRight size={14} />
                    </button>
                  </div>
                </Panel>
              </div>
              <div className="three-grid">
                {[
                  "Executive summary",
                  "Business growth",
                  "Financial flow",
                  "Vendor/game observations",
                  "Player risk observations",
                  "Recommended investigations",
                ].map((s, i) => (
                  <Panel key={s} title={s}>
                    <p className="insight-text">
                      {
                        [
                          answers[4],
                          "Deposits are improving while acquisition has softened. Review registrations and first-depositor mix.",
                          "Positive M1 net flow of BDT 32.78M. Cash flow and company gaming result are distinct measures.",
                          answers[2],
                          "Review priority is elevated for two fictional players; correlated signals are not proof of wrongdoing.",
                          "Review MI-2048, compare JILI game outcomes with its historical baseline, and assess M7 deposit trends.",
                        ][i]
                      }
                    </p>
                  </Panel>
                ))}
              </div>
            </>
          )}
          {page === 8 && (
            <>
              {riskDisclaimer}
              <div className="section-note">
                <Bell size={18} />
                Telegram-style previews
                <span>Simulation only. No messages are sent.</span>
              </div>
              <div className="two-grid">
                {Array.from(new Set([...generated, cases[0].id])).map((id) => {
                  const c = cases.find((c) => c.id === id)!;
                  return (
                    <Panel
                      key={id}
                      title="High priority review"
                      subtitle={`${c.id} · Telegram preview`}
                      action={
                        <Badge>
                          {reviewedAlerts.includes(id) ? "Reviewed" : "Preview"}
                        </Badge>
                      }
                    >
                      <div className="telegram-preview">
                        <div className="telegram-header">
                          <span className="logo-mark">
                            <Layers3 size={18} />
                          </span>
                          <div>
                            MELON Intelligence<small>Demo alert bot</small>
                          </div>
                          <span>{c.time}</span>
                        </div>
                        <h3>🚨 {c.severity.toUpperCase()} PRIORITY REVIEW</h3>
                        <p>
                          Brand: <b>{c.brand}</b>
                          <br />
                          Player: <b>{c.player}</b>
                          <br />
                          Withdrawal: <b>{money(c.amount, true)}</b>
                          <br />
                          Risk Score: <b>{c.score}/100</b>
                        </p>
                        <b>Signals</b>
                        <ul>
                          {c.signals.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                        <p>
                          <b>Assessment</b>
                          <br />
                          Multiple signals require contextual review. No fraud
                          determination. Manual review recommended.
                        </p>
                        <div className="action-grid">
                          <button
                            className="button"
                            onClick={() => investigate(c)}
                          >
                            <Eye size={15} />
                            Open Investigation
                          </button>
                          <button
                            className="button"
                            onClick={() => {
                              setReviewedAlerts((a) => [...a, id]);
                              setCases((a) =>
                                a.map((x) =>
                                  x.id === id
                                    ? { ...x, status: "Reviewed" }
                                    : x,
                                ),
                              );
                              setSelected((s) =>
                                s.id === id ? { ...s, status: "Reviewed" } : s,
                              );
                              notify("Alert and linked case marked reviewed.");
                            }}
                          >
                            <Check size={15} />
                            Mark Reviewed
                          </button>
                        </div>
                      </div>
                    </Panel>
                  );
                })}
                <Panel
                  title="Business alerts"
                  subtitle="Simulated operational notifications"
                >
                  <div className="feed">
                    {businessAlerts.map((a, i) => (
                      <article key={a.title}>
                        <div className="feed-top">
                          <Badge>{a.severity}</Badge>
                          <span>{a.brand} · Today</span>
                        </div>
                        <h3>{a.title}</h3>
                        <p>{a.detail}</p>
                        <button
                          className="text-button"
                          onClick={() => {
                            setBrand(brands.find((b) => b.id === a.brand)!);
                            go(i === 2 ? 3 : i === 3 ? 4 : 1);
                          }}
                        >
                          View supporting data <ArrowRight size={14} />
                        </button>
                      </article>
                    ))}
                  </div>
                </Panel>
              </div>
            </>
          )}
          {page === 9 && (
            <>
              <div className="section-note">
                <Cpu size={18} />
                Planned Production Architecture
                <span>All connections below are simulated.</span>
              </div>
              <Panel
                title="From source to decision"
                subtitle="Future architecture · no collectors, database, AI or Telegram are connected"
              >
                <div className="pipeline">
                  {pipeline.map((p, i) => (
                    <div key={p}>
                      <span>{String(i + 1).padStart(2, "0")}</span>
                      <b>{p}</b>
                      {i < 7 && <ChevronRight size={16} />}
                    </div>
                  ))}
                </div>
              </Panel>
              <div className="system-grid">
                {brands.map((b, i) => (
                  <section className="panel system-card" key={b.id}>
                    <div>
                      <span className="brand-icon">{b.id}</span>
                      <Badge>Connected</Badge>
                    </div>
                    <h3>{b.name}</h3>
                    <dl>
                      <dt>Last sync</dt>
                      <dd>{lastRefresh}</dd>
                      <dt>Latency</dt>
                      <dd>{connectionStats[i].latency} ms</dd>
                      <dt>Records processed</dt>
                      <dd>{num(connectionStats[i].records)}</dd>
                      <dt>Monitoring status</dt>
                      <dd className="positive">Simulated / active</dd>
                    </dl>
                    <div className="system-line" />
                  </section>
                ))}
              </div>
            </>
          )}
          <footer>
            <span>
              Proof of Concept • Demo data • Production version will connect to
              authorized MELON Back Office sources.
            </span>
            <span>
              <i className="dot" />
              Last simulated refresh {lastRefresh}
            </span>
          </footer>
        </div>
      </main>
      {vendor && (
        <div className="modal-backdrop" onClick={() => setVendor(null)}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={`${vendor.name} investigation`}
            className="drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="panel-head">
              <div>
                <div className="eyebrow">VENDOR INVESTIGATION · M1</div>
                <h2>{vendor.name}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close vendor investigation"
                onClick={() => setVendor(null)}
              >
                <X />
              </button>
            </div>
            <Badge>{vendor.risk}</Badge>
            <p className="disclaimer">
              Statistical variance can produce short-term losses. Risk status
              represents investigation priority, not a fraud determination.
            </p>
            <div className="detail-grid">
              {Object.entries({
                "Unique players": num(vendor.players),
                "Bet count": num(vendor.bets),
                Stake: money(vendor.stake),
                "Company W/L": money(vendor.wl),
                "Current margin": `${((vendor.wl / vendor.stake) * 100).toFixed(2)}%`,
                "Historical baseline": `${vendor.baseline.toFixed(2)}%`,
              }).map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <h3>Historical vs current performance</h3>
            <Chart data={vendorHistory(vendor)} keys={["wl"]} height={210} />
            <h3>Top contributing players</h3>
            <p className="muted">
              Top three account for 72% of simulated absolute result.
            </p>
            {cases.slice(0, 3).map((c, i) => (
              <button
                className="drawer-player"
                key={c.id}
                onClick={() => {
                  setVendor(null);
                  investigate({ ...c, vendor: vendor.name });
                }}
              >
                <span>
                  {c.player}
                  <small>
                    {demoConfig.topConcentration[i]}% of absolute result
                  </small>
                </span>
                <ArrowRight size={15} />
              </button>
            ))}
            <div className="assessment">
              <Sparkles size={20} />
              <h3>AI interpretation</h3>
              <p>
                {vendor.wl < 0
                  ? "Negative contribution and player concentration warrant review."
                  : "Performance remains positive; inspect concentration and game mix for context."}{" "}
                Compare longer historical windows before escalation. This is
                predefined demo analysis.
              </p>
            </div>
            <button
              className="button primary-button"
              onClick={() => {
                setVendor(null);
                investigate({ ...cases[0], vendor: vendor.name });
              }}
            >
              Investigate Players <ArrowRight size={16} />
            </button>
          </section>
        </div>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={18} />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
export default App;
