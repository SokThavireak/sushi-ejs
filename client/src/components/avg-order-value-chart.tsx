import React, { useMemo } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface AvgItem {
  day: string;
  avg_value: string;
}

export const AvgOrderValueChart: React.FC<{ data: AvgItem[] }> = ({ data }) => {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      name: item.day,
      value: parseFloat(item.avg_value) || 0,
    }));
  }, [data]);

  return (
    <Card className="shadow-none dark:ring-0 md:col-span-2">
      <CardHeader>
        <CardTitle className="font-semibold text-lg text-gray-900 dark:text-white">
          Average Order Value
        </CardTitle>
        <CardDescription>
          Daily average transaction amount trend for the last 7 days.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
              <XAxis dataKey="name" tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, "Average Order Value"]}
              />
              <Line type="monotone" dataKey="value" stroke="#ea580c" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No transaction trend data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
