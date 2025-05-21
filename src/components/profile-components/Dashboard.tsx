import React from "react";
import SummarySection from "@/components/profile-components/SummarySection";
import TokenAllocationChart from "@/components/profile-components/TokenAllocationChart";
import PerformanceChart from "@/components/profile-components/PerformanceChart";
import TokenTable from "@/components/profile-components/TokenTable";

export default function Dashboard() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TokenAllocationChart />
                <PerformanceChart />
            </div>
            <TokenTable />
        </div>
    );
}

