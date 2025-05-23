
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Component } from "@/components/profile-components/LineChart";

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
                <div >
                    <Component />
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
