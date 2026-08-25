"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrowthChartProps {
  title: string;
  indicator: string;
  data: any[];
  xKey: "month" | "cm";
  xLabel: string;
  yLabel: string;
  measurementValue: number | null;
  measurementX: number;
  statusLabel?: string;
  statusKey?: string;
  unit?: string;
}

const STATUS_COLORS: Record<string, string> = {
  "sangat-kurang": "#dc2626",
  "kurang": "#f97316",
  "normal": "#16a34a",
  "berlebih": "#dc2626",
  "sangat-pendek": "#dc2626",
  "pendek": "#f97316",
  "tinggi": "#0ea5e9",
  "sangat-kurus": "#dc2626",
  "kurus": "#f97316",
  "risiko": "#eab308",
  "gemuk": "#dc2626",
  "tidak-valid": "#6b7280",
};

export function GrowthChart({
  title,
  indicator,
  data,
  xKey,
  xLabel,
  yLabel,
  measurementValue,
  measurementX,
  statusLabel,
  statusKey,
  unit = "",
}: GrowthChartProps) {
  const hasData = data.length > 0 && measurementValue !== null;

  return (
    <Card className="overflow-hidden border-0 shadow-md rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              {title}
            </CardTitle>
            <p className="text-xs text-gray-600 mt-1">{indicator}</p>
          </div>
          {statusLabel && (
            <Badge
              className={cn(
                "text-xs",
                statusKey && STATUS_COLORS[statusKey]
                  ? "text-white border-0"
                  : ""
              )}
              style={{
                backgroundColor: statusKey ? STATUS_COLORS[statusKey] : undefined,
              }}
            >
              {statusLabel}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {hasData ? (
          <div className="w-full h-[280px] sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey={xKey}
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(v) => `${v}`}
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  label={{
                    value: xLabel,
                    position: "insideBottom",
                    offset: -5,
                    style: { fontSize: 11, fill: "#6b7280" },
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  width={45}
                  label={{
                    value: yLabel,
                    angle: -90,
                    position: "insideLeft",
                    style: { fontSize: 11, fill: "#6b7280", textAnchor: "middle" },
                  }}
                  domain={["dataMin - 1", "dataMax + 1"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => (unit ? `${v.toFixed(1)} ${unit}` : v.toFixed(2))}
                  labelFormatter={(v) => `${xLabel}: ${v}`}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 5 }} />
                {/* SD curves */}
                <Line
                  type="monotone"
                  dataKey="sd3neg"
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="-3 SD"
                />
                <Line
                  type="monotone"
                  dataKey="sd2neg"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="-2 SD"
                />
                <Line
                  type="monotone"
                  dataKey="sd1neg"
                  stroke="#eab308"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="-1 SD"
                />
                <Line
                  type="monotone"
                  dataKey="median"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={false}
                  name="Median"
                />
                <Line
                  type="monotone"
                  dataKey="sd1"
                  stroke="#0ea5e9"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  dot={false}
                  name="+1 SD"
                />
                <Line
                  type="monotone"
                  dataKey="sd2"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="+2 SD"
                />
                <Line
                  type="monotone"
                  dataKey="sd3"
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  dot={false}
                  name="+3 SD"
                />
                {/* Reference dot for child's measurement */}
                <ReferenceDot
                  x={measurementX}
                  y={measurementValue}
                  r={7}
                  fill="#dc2626"
                  stroke="white"
                  strokeWidth={2.5}
                  isFront
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Grafik tidak tersedia karena data di luar rentang valid WHO.
          </div>
        )}
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-blue-50/50 border border-blue-100 rounded-lg p-2">
          <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
          <span>
            Titik merah menunjukkan hasil pengukuran anak. Garis hijau adalah median WHO, garis kuning/oranye/merah menunjukkan standar deviasi -1, -2, -3 dan +1, +2, +3.
            Grafik digunakan untuk membantu memantau pola pertumbuhan anak dari waktu ke waktu.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
