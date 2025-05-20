import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SummarySection() {
  const summaryItems = [
    { label: "Net Worth", value: "$327,963.94" },
    { label: "Claimable", value: "$148.64" },
    { label: "Total Assets", value: "$380,434.38" },
    { label: "Total Debts", value: "$52,470.42" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {summaryItems.map((item, index) => (
        <Card key={index} className="bg-gray-800">
          <CardHeader>
            <CardTitle>{item.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
