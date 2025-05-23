"use client"

import { useState, useEffect } from "react"
import { 
    CartesianGrid, 
    XAxis, 
    YAxis, 
    ResponsiveContainer,
    Tooltip,
    Area,
    AreaChart
} from "recharts"
import { TrendingUp } from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart"
import { useWallet } from '@suiet/wallet-kit'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWalletValue } from "@/context/WalletValueContext"

// Custom tooltip formatter
interface TooltipProps {
    active?: boolean;
    payload?: Array<{
        payload: {
            time: string;
            value: number;
        };
    }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-background border border-primary rounded p-2 shadow-md">
                <p className="font-medium text-sm text-white">{data.time}</p>
                <p className="text-primary text-lg font-bold ">${data.value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

// Generate simplified data points for visualization
const generateSimpleData = (currentValue: number, period: string) => {
    // If the value is 0, just return a flat line at 0
    if (currentValue === 0) {
        return Array(5).fill(0).map((_, i) => ({
            time: ["12:15", "12:30", "12:45", "1:00", "Now"][i],
            value: 0
        }));
    }
    
    // Create 5 points to make a simple line/area instead of a single dot
    const numPoints = 5;
    const points = [];
    
    // Determine the time labels based on selected period
    const timeLabels = {
        "1h": ["12:15", "12:30", "12:45", "1:00", "Now"],
        "1d": ["8am", "12pm", "4pm", "8pm", "Now"],
        "1w": ["Mon", "Tue", "Wed", "Thu", "Now"],
        "1m": ["W1", "W2", "W3", "W4", "Now"],  // Shortened for mobile
        "1y": ["Q1", "Q2", "Q3", "Q4", "Now"],
    };
    
    // Use the current value with slight variations (showing a mostly flat trend)
    for (let i = 0; i < numPoints; i++) {
        // Small random variations (±1-2% for visual interest)
        const variation = currentValue * (0.98 + (Math.random() * 0.04));
        // The last point is exactly the current value
        const value = i === numPoints - 1 ? currentValue : variation;
        
        points.push({
            time: timeLabels[period as keyof typeof timeLabels][i],
            value: value
        });
    }
    
    return points;
};

export default function WalletBalanceChart() {
    const { connected } = useWallet();
    const [selectedPeriod, setSelectedPeriod] = useState("1h");
    const { totalValue } = useWalletValue();
    const [chartData, setChartData] = useState<Array<{time: string, value: number}>>([]);
    
    // Update chart data when period or totalValue changes
    useEffect(() => {
        setChartData(generateSimpleData(totalValue, selectedPeriod));
    }, [selectedPeriod, totalValue]);
    
    // Simple chart config
    const chartConfig: ChartConfig = {
        value: {
            label: "Balance",
            color: "#37b24d", // A green color for the line
        },
    };
    
    return (
        <Card className="bg-background border border-primary rounded-xl overflow-hidden relative w-full">
            <CardHeader className="pb-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-white">Portfolio Value</CardTitle>
                    <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="sm:ml-auto">
                        <TabsList>
                            <TabsTrigger value="1h">1H</TabsTrigger>
                            <TabsTrigger value="1d">1D</TabsTrigger>
                            <TabsTrigger value="1w">1W</TabsTrigger>
                            <TabsTrigger value="1m">1M</TabsTrigger>
                            <TabsTrigger value="1y">1Y</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
                <div className="flex items-center gap-2 mt-2 mb-2">
                    <span className="text-2xl font-bold text-white">
                        ${totalValue.toLocaleString(undefined, {maximumFractionDigits: 2})}
                    </span>
                    <span className="flex items-center text-sm text-green-500">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +0.00%
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {!connected ? (
                    <div className="h-[180px] flex items-center justify-center text-gray-400">
                        Connect your wallet to view balance history
                    </div>
                ) : (
                    <div className="h-[220px] w-full pt-4 relative">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={chartData}
                                    margin={{
                                        top: 5,
                                        right: 10,
                                        left: 10,
                                        bottom: 25,
                                    }}
                                >
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#37b24d" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#37b24d" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis 
                                        dataKey="time" 
                                        tickLine={false} 
                                        axisLine={false}
                                        tick={{ fill: '#6b7280', fontSize: '0.75rem' }} 
                                        tickMargin={10}
                                        dy={10}
                                        interval="preserveStartEnd"
                                        minTickGap={15}
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                        domain={['dataMin - 1', 'dataMax + 1']}
                                        hide
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#37b24d"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                        dot={{ r: 4, fill: "#37b24d", strokeWidth: 0 }}
                                        activeDot={{ r: 6, fill: "#37b24d", stroke: "#ffffff", strokeWidth: 2 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 