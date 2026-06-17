import React, { useMemo } from "react";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface LocationItem {
  location: string;
  sales: string;
}

const COLORS = ["#ea580c", "#18181b", "#71717a", "#a1a1aa", "#ea580c", "#27272a"];

export const LocationSalesChart: React.FC<{ data: LocationItem[] }> = ({ data }) => {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      name: item.location,
      sales: parseFloat(item.sales) || 0,
    }));
  }, [data]);

  return (
    <Card className="shadow-none dark:ring-0 md:col-span-2">
      <CardHeader>
        <CardTitle className="font-semibold text-lg text-gray-900 dark:text-white">
          Sales by Location
        </CardTitle>
        <CardDescription>
          Gross revenue breakdown per location in the store.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[280px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
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
                formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, "Sales"]}
              />
              <Bar 
                dataKey="sales" 
                barSize={16}
                background={{ fill: "rgba(120, 120, 120, 0.1)", radius: 8 }}
                radius={[8, 8, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No sales data available by location.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
