import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatusItem {
  status: string;
  count: string;
}

const COLORS = ["#ea580c", "#18181b", "#71717a", "#a1a1aa", "#e4e4e7"];

export const OrderStatusDonut: React.FC<{ data: StatusItem[] }> = ({ data }) => {
  const chartData = useMemo(() => {
    return (data || []).map((item) => ({
      name: item.status,
      value: parseInt(item.count) || 0,
    }));
  }, [data]);

  const total = useMemo(() => chartData.reduce((acc, curr) => acc + curr.value, 0), [chartData]);

  return (
    <Card className="shadow-none dark:ring-0 flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="font-semibold text-lg text-gray-900 dark:text-white">
          Orders Status breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center">
        {total > 0 ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-full h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{total}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Orders</span>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2.5 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
              {chartData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400 truncate max-w-[90px] font-medium">
                    {item.name}
                  </span>
                  <span className="font-bold ml-auto tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400 py-10 text-center">No orders found</p>
        )}
      </CardContent>
    </Card>
  );
};
