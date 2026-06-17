import { cn } from "@/lib/utils";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Delta, DeltaIcon, DeltaValue } from "@/components/delta";

interface DashboardStatsProps {
	totalRevenue: string;
	ordersCount: number;
	productsCount: number;
	userCount: number;
}

export function DashboardStats({ totalRevenue, ordersCount, productsCount, userCount }: DashboardStatsProps) {
	const stats = [
		{
			label: "Total Revenue",
			value: `${parseFloat(totalRevenue || "0").toFixed(2)} $`,
			delta: 12.4,
			footnote: "vs yesterday",
			lowerIsBetter: false,
		},
		{
			label: "Orders Count",
			value: String(ordersCount || 0),
			delta: 5.2,
			footnote: "vs last week",
			lowerIsBetter: false,
		},
		{
			label: "Master Menu",
			value: `${productsCount || 0} Items`,
			delta: 0,
			footnote: "active items",
			lowerIsBetter: false,
		},
		{
			label: "User Accounts",
			value: String(userCount || 0),
			delta: 1.1,
			footnote: "vs last week",
			lowerIsBetter: false,
		},
	];

	return (
		<>
			{stats.map((s) => (
				<Card className={cn("shadow-none dark:ring-0")} key={s.label}>
					<CardHeader>
						<CardTitle className="font-normal text-muted-foreground text-xs">
							{s.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<p className="font-semibold text-2xl tabular-nums">{s.value}</p>
						<div className="flex items-center gap-2 text-xs">
							<span className={cn(
								"inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[10px] tracking-tight",
								s.delta >= 0 
									? "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30"
									: "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700"
							)}>
								{s.delta >= 0 ? "↑" : "↓"} {Math.abs(s.delta).toFixed(1)}%
							</span>
							<span className="text-gray-400 dark:text-zinc-500 font-medium">{s.footnote}</span>
						</div>
					</CardContent>
				</Card>
			))}
		</>
	);
}
