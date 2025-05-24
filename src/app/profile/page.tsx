
import Dashboard from "@/components/profile-components/Dashboard";
import Header from '@/components/header'

const Profile = () => {
  return (
    <div>
      <Header />
      <div className="lg:px-[70px] mb-6 lg:max-w-5xl w-full px-4 mx-auto mt-[48px]">
        <Dashboard />
      </div>
    </div>
  )
}

export default Profile