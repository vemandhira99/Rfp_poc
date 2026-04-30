'use client'

import { useState, useEffect } from 'react'
import { 
  Sun, 
  Moon, 
  Bell, 
  Shield, 
  UserCircle2, 
  Mail,
  Check,
  Brain,
  Building2,
  Cpu,
  Monitor
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SettingsViewProps {
  userRole: 'pm' | 'architect'
}

export function SettingsView({ userRole }: SettingsViewProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState({
    newRfp: true,
    responseReady: true,
    deadlines: true
  })
  const [profile, setProfile] = useState({
    name: userRole === 'pm' ? 'Yash Khanvinde' : 'Alok Jha',
    email: userRole === 'pm' ? 'yash@dhira.ai' : 'alok.jha@enterprise.com',
    company: userRole === 'pm' ? 'Dhira AI' : 'Enterprise SaaS Solutions'
  })
  const [aiPrefs, setAiPrefs] = useState({
    detailLevel: 'balanced',
    tone: 'professional',
    knowledgeRecall: 'comprehensive'
  })
  const [isSaved, setIsSaved] = useState(false)

  // Apply dark mode theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Load settings from local storage
  useEffect(() => {
    const savedSettings = localStorage.getItem(`rfp_settings_${userRole}`)
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      setDarkMode(parsed.darkMode)
      setNotifications(parsed.notifications)
    }
  }, [userRole])

  const handleSave = () => {
    localStorage.setItem(`rfp_settings_${userRole}`, JSON.stringify({
      darkMode,
      notifications,
      profile,
      aiPrefs
    }))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <div className="max-w-4xl space-y-8 dark:text-zinc-100">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Settings</h1>
        <p className="text-zinc-500 mt-1 dark:text-zinc-400">Manage your platform preferences and notification rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Section */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/30 dark:bg-zinc-800/50 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <UserCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Profile Settings</CardTitle>
                  <CardDescription className="text-xs font-medium dark:text-zinc-400">Manage your personal and company information</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Full Name</label>
                  <Input 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})}
                    className="h-12 rounded-xl border-zinc-200 focus:ring-zinc-900 font-medium dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Email Address</label>
                  <Input 
                    value={profile.email} 
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    className="h-12 rounded-xl border-zinc-200 focus:ring-zinc-900 font-medium dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    value={profile.company} 
                    onChange={e => setProfile({...profile, company: e.target.value})}
                    className="h-12 pl-11 rounded-xl border-zinc-200 focus:ring-zinc-900 font-medium dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Preferences */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden bg-white dark:bg-zinc-900 dark:border-zinc-800">
            <CardHeader className="border-b border-zinc-100 bg-zinc-50/30 dark:bg-zinc-800/50 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">AI Advisor Behavior</CardTitle>
                  <CardDescription className="text-xs font-medium dark:text-zinc-400">Customize how the AI analyzes and suggests responses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'detailLevel', label: 'Analysis Depth', options: ['Concise', 'Balanced', 'Exhaustive'], icon: Cpu },
                  { id: 'tone', label: 'Response Tone', options: ['Direct', 'Professional', 'Persuasive'], icon: Mail },
                  { id: 'knowledgeRecall', label: 'Knowledge Base', options: ['Specific', 'Comprehensive', 'Global'], icon: Shield }
                ].map((pref) => (
                  <div key={pref.id} className="space-y-3 p-4 rounded-2xl border border-zinc-100 bg-zinc-50/50 dark:bg-zinc-950 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <pref.icon className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{pref.label}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {pref.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setAiPrefs({...aiPrefs, [pref.id]: opt.toLowerCase()})}
                          className={cn(
                            "text-left px-3 py-2 rounded-lg text-xs font-bold transition-all",
                            aiPrefs[pref.id as keyof typeof aiPrefs] === opt.toLowerCase()
                              ? "bg-zinc-900 text-white shadow-md shadow-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
                              : "bg-white text-zinc-500 border border-zinc-100 hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Appearance & Notifications in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Appearance Section */}
            <Card className="border-zinc-200 shadow-sm overflow-hidden h-full">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                <CardTitle className="text-md font-black flex items-center gap-2 uppercase tracking-tight">
                  <Sun className="w-4 h-4 text-zinc-500" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 flex flex-col justify-between h-[calc(100%-60px)]">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-zinc-900">Interface Theme</p>
                    <p className="text-[10px] text-zinc-500 font-medium">Toggle dark mode for dashboard</p>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors outline-none",
                      darkMode ? "bg-zinc-900" : "bg-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                      darkMode ? "translate-x-6" : "translate-x-1"
                    )} />
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 shadow-sm overflow-hidden h-full">
              <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                <CardTitle className="text-md font-black flex items-center gap-2 uppercase tracking-tight">
                  <Bell className="w-4 h-4 text-zinc-500" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[
                  { id: 'newRfp', label: 'New RFP Submissions' },
                  { id: 'responseReady', label: 'Analysis Complete' }
                ].map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-50 transition-colors">
                    <span className="text-xs font-bold text-zinc-700">{item.label}</span>
                    <button 
                      onClick={() => toggleNotification(item.id as any)}
                      className={cn(
                        "w-5 h-5 rounded border transition-all flex items-center justify-center",
                        notifications[item.id as keyof typeof notifications] ? "bg-zinc-900 border-zinc-900 text-white" : "border-zinc-200"
                      )}
                    >
                      {notifications[item.id as keyof typeof notifications] && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Status Sidebar */}
          <Card className="border-zinc-200 shadow-sm overflow-hidden bg-zinc-900 text-white">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-black text-blue-400">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-black tracking-tight">{profile.name}</p>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{userRole === 'pm' ? 'Project Lead' : 'Architect'}</p>
                </div>
              </div>
              <div className="h-px bg-zinc-800" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">System Status</span>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black">OPERATIONAL</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">API Health</span>
                  <span className="text-[10px] font-black text-blue-400">99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Last Synced</span>
                  <span className="text-[10px] font-black text-zinc-400">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <Button 
                onClick={handleSave}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl h-12 shadow-lg shadow-blue-900/20 transition-all active:scale-95 mt-4"
              >
                {isSaved ? 'All Changes Saved' : 'Update Preferences'}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm bg-white p-6 space-y-4">
            <div className="flex items-center gap-3 text-zinc-400">
              <Monitor className="w-5 h-5" />
              <h4 className="text-xs font-black uppercase tracking-widest text-zinc-900">Environment</h4>
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500">Version</span>
                <span className="text-[10px] font-black text-zinc-900">v1.2.4-stable</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500">Region</span>
                <span className="text-[10px] font-black text-zinc-900">India (West)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
