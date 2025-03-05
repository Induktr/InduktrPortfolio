import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "@/lib/theme-provider";

interface ComparisonData {
  name: string;
  performance: number;
  reliability: number;
  usability: number;
}

const toolComparisonData: ComparisonData[] = [
  {
    name: "BrainMessenger",
    performance: 95,
    reliability: 90,
    usability: 88
  },
  {
    name: "FinanceFlow",
    performance: 92,
    reliability: 94,
    usability: 85
  },
  {
    name: "BuildKo",
    performance: 88,
    reliability: 92,
    usability: 90
  },
  {
    name: "BueatyLove",
    performance: 86,
    reliability: 88,
    usability: 94
  }
];

export function ToolComparison() {
  const { theme } = useTheme();
  const [activeMetric, setActiveMetric] = useState<string>("performance");

  const metrics = [
    { key: "performance", label: "Производительность" },
    { key: "reliability", label: "Надежность" },
    { key: "usability", label: "Удобство использования" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {metrics.map(metric => (
          <button
            key={metric.key}
            onClick={() => setActiveMetric(metric.key)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeMetric === metric.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            {metric.label}
          </button>
        ))}
      </div>
      
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={toolComparisonData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme === "dark" ? "#333" : "#eee"}
            />
            <XAxis
              dataKey="name"
              stroke={theme === "dark" ? "#888" : "#333"}
            />
            <YAxis
              stroke={theme === "dark" ? "#888" : "#333"}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1a1a1a" : "#fff",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
              }}
            />
            <Legend />
            <Bar
              dataKey={activeMetric}
              fill="var(--primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
