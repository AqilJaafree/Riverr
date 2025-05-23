// import TokenAllocationChart from "@/components/profile-components/TokenAllocationChart";
// import PerformanceChart from "@/components/profile-components/PerformanceChart";
// import SummarySection from "@/components/profile-components/SummarySection";
import TokenTable from "@/components/profile-components/TokenTable";
import WalletBalanceChart from "@/components/profile-components/WalletBalanceChart";

export default function Dashboard() {
    return (
        <div className="space-y-8 w-full">
            {/* <SummarySection />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TokenAllocationChart />
                <PerformanceChart />
            </div> */}
            <WalletBalanceChart />
            <TokenTable />
        </div>
    );
}

