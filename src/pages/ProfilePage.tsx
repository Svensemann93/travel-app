import AppHeader from '../components/AppHeader'
import ProfileHero from '../components/ProfileHero'
import ProfileStats from '../components/ProfileStats'
import ProfileTabs from '../components/ProfileTabs'
import ProfileAbout from '../components/ProfileAbout'

function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
        {' '}
        <ProfileHero />
        <ProfileStats />
        <div className="space-y-6">
          <ProfileTabs active="about" />
          <ProfileAbout />
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
