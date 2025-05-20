import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function PerformanceChart() {
    // Dummy performance data for illustration
    const performanceData = [
        { token: "BTC", performance: "-1.2%" },
        { token: "USDT", performance: "+0.55%" },
        { token: "WETH", performance: "-1.2%" },
    ];

    return (
        <Card className="bg-gray-800">
            <CardHeader>
                <CardTitle>Cumulative P&amp;L</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Replace this with an actual line chart */}
                <div className="h-64 flex items-center justify-center border border-dashed border-gray-700">
                    <p>Line Chart Placeholder</p>
                </div>
                <ul className="mt-4 space-y-2">
                    {performanceData.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.token}</span>
                            <span>{item.performance}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
