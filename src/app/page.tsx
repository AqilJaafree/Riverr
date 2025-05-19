import News from "@/components/dashboard-components/News";
import ChatBox from "@/components/dashboard-components/ChatBox";
import Header from "@/components/header";
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="w-full flex lg:gap-4 relative lg:px-[70px] px-4">
        <div className="flex-1">
          <ChatBox />
        </div>
        <div className="lg:w-[408px]">
          <News />
        </div>
      </main>
    </div>
  );
}
