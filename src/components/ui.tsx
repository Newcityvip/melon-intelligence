import type { ReactNode } from "react";
import { Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
const colors = ["#5cdeb4", "#629cff", "#c4a0ff", "#e8b864"];
export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={`badge ${String(children).toLowerCase().replaceAll(" ", "-")}`}
    >
      {children}
    </span>
  );
}
export function Panel({
  title,
  subtitle,
  children,
  action,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Chart({
  data,
  keys = ["deposit", "withdrawal", "wl"],
  height = 260,
  bar = false,
  wlLabel = "Company W/L",
}: {
  data: Record<string, string | number>[];
  keys?: string[];
  height?: number;
  bar?: boolean;
  wlLabel?: string;
}) {
  const labels: Record<string, string> = {
    deposit: "Deposits",
    withdrawal: "Withdrawals",
    wl: wlLabel,
    turnover: "Turnover",
    margin: "Margin %",
    registered: "Registrations",
    first: "First depositors",
    bets: "Bets",
  };
  const content = (
    <>
      <CartesianGrid stroke="#24303d" vertical={false} strokeDasharray="3 5" />
      <XAxis
        dataKey="time"
        tick={{ fill: "#8190a4", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        minTickGap={30}
      />
      <YAxis
        tick={{ fill: "#8190a4", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={48}
        tickFormatter={(v) =>
          Math.abs(v) >= 1e6
            ? `${(v / 1e6).toFixed(1)}m`
            : Math.abs(v) >= 1000
              ? `${(v / 1000).toFixed(0)}k`
              : `${v.toFixed(keys.includes("margin") ? 1 : 0)}`
        }
      />
      <Tooltip
        contentStyle={{
          background: "#152131",
          border: "1px solid #34445b",
          borderRadius: 8,
          color: "#eef5ff",
        }}
        formatter={(v, name) => [
          Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 }),
          labels[String(name)] || name,
        ]}
      />
      {keys.map((k, i) =>
        bar ? (
          <Bar
            isAnimationActive={false}
            key={k}
            dataKey={k}
            fill={colors[i % 4]}
            radius={[4, 4, 0, 0]}
          />
        ) : (
          <Area
            isAnimationActive={false}
            key={k}
            type="monotone"
            dataKey={k}
            stroke={colors[i % 4]}
            fill={colors[i % 4]}
            fillOpacity={i === 0 ? 0.12 : 0.025}
            strokeWidth={2.3}
          />
        ),
      )}
    </>
  );
  return (
    <>
      <div className="legend">
        {keys.map((k, i) => (
          <span key={k}>
            <i style={{ background: colors[i % 4] }} />
            {labels[k] || k}
          </span>
        ))}
      </div>
      <div style={{ height, width: "100%", minWidth: 0 }}>
        <ResponsiveContainer>
          {bar ? (
            <BarChart data={data}>{content}</BarChart>
          ) : (
            <AreaChart data={data}>{content}</AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </>
  );
}
export function Kpi({
  label,
  value,
  change,
  neutral = false,
}: {
  label: string;
  value: string;
  change: number;
  neutral?: boolean;
}) {
  return (
    <div className="kpi">
      <span className="kpi-label">
        {label}
        <Activity size={13} />
      </span>
      <strong>{value}</strong>
      <div className="kpi-bottom">
        <span
          className={neutral ? "muted" : change >= 0 ? "positive" : "negative"}
        >
          {change >= 0 ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}{" "}
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
        <span>vs prior</span>
        <div className="spark" title="Illustrative demo trend">
          <ResponsiveContainer>
            <LineChart
              data={[4, 6, 5, 8, 7, 9, 8, 12].map((n, i) => ({
                v: change >= 0 ? n : 14 - n,
                i,
              }))}
            >
              <Line
                isAnimationActive={false}
                dataKey="v"
                dot={false}
                stroke={
                  neutral ? "#e8b864" : change >= 0 ? "#5cdeb4" : "#ed8790"
                }
                strokeWidth={1.6}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
export function Score({ score }: { score: number }) {
  return (
    <div className="score">
      <span>
        {score}
        <small>/100</small>
      </span>
      <div>
        <i
          style={{
            width: `${score}%`,
            background:
              score >= 75 ? "#f08088" : score >= 45 ? "#e8b864" : "#5cdeb4",
          }}
        />
      </div>
    </div>
  );
}
