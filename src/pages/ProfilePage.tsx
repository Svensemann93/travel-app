import { useState } from 'react'
import AppHeader from '../components/AppHeader'
import ProfileHero from '../components/ProfileHero'
import ProfileStats from '../components/ProfileStats'
import ProfileTabs, { type ProfileTab } from '../components/ProfileTabs'
import ProfileAbout from '../components/ProfileAbout'
import ProfileJournals from '../components/ProfileJournals'
import ProfileMap from '../components/ProfileMap'

function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>('journals')

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <main className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
        <ProfileHero />
        <ProfileStats />

        <div className="space-y-6">
          <ProfileTabs active={tab} onSelect={setTab} />
          {tab === 'journals' && <ProfileJournals />}
          {tab === 'map' && <ProfileMap />}
          {tab === 'about' && <ProfileAbout />}
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
