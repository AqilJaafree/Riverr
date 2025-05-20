
import Dashboard from "@/components/profile-components/Dashboard";
import Header from '@/components/header'

const Profile = () => {
  return (
    <div>
      <Header />
      <main className="p-6">
        <Dashboard />
      </main>
    </div>
  )
}

export default Profile