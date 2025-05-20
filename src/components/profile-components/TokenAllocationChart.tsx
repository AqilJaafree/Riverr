import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function TokenAllocationChart() {
    // Dummy data for token distribution
    const data = [
        { token: "USDT", percentage: 36.69 },
        { token: "WBTC", percentage: 25.50 },
        { token: "WETH", percentage: 25.44 },
        { token: "DAI", percentage: 6.76 },
        { token: "MATIC", percentage: 2.29 },
        { token: "Others", percentage: 3.33 },
    ];

    return (
        <Card className="bg-gray-800">
            <CardHeader>
                <CardTitle>Token Allocation</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Replace this placeholder with an actual chart component */}
                <div className="h-64 flex items-center justify-center border border-dashed border-gray-700">
                    <p>Pie Chart Placeholder</p>
                </div>
                <ul className="mt-4 space-y-2">
                    {data.map((item, index) => (
                        <li key={index} className="flex justify-between">
                            <span>{item.token}</span>
                            <span>{item.percentage}%</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
