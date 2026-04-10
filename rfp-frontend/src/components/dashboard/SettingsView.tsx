'use client'

import { useState, useEffect } from 'react'
import { 
  Sun, 
  Moon, 
  Bell, 
  Shield, 
  UserCircle2, 
  Mail,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  const [isSaved, setIsSaved] = useState(false)

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
      notifications
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
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Settings</h1>
        <p className="text-zinc-500 mt-1">Manage your platform preferences and notification rules</p>
      </div>

      <div className="grid gap-6">
        {/* Appearance Section */}
        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Sun className="w-5 h-5 text-zinc-500" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-zinc-900">Interface Theme</p>
                <p className="text-xs text-zinc-500">Toggle between light and dark mode for your dashboard</p>
              </div>
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={cn(
                  "relative inline-flex h-7 w-12 items-center rounded-full transition-colors outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-zinc-900",
                  darkMode ? "bg-zinc-900" : "bg-zinc-200"
                )}
              >
                <span className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm",
                  darkMode ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="border-zinc-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-zinc-500" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100">
              {[
                { id: 'newRfp', label: 'New RFP submissions', description: 'Get notified when a new RFP is uploaded to the system' },
                { id: 'responseReady', label: 'Response ready for review', description: 'Be alerted when a solution architect completes a section' },
                { id: 'deadlines', label: 'Approaching deadlines', description: 'Summary alerts for RFPs due within the next 48 hours' }
              ].map((item) => (
                <div key={item.id} className="p-6 flex items-start justify-between hover:bg-zinc-50 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                    <p className="text-xs text-zinc-500 max-w-sm">{item.description}</p>
                  </div>
                  <button 
                    onClick={() => toggleNotification(item.id as keyof typeof notifications)}
                    className={cn(
                      "w-6 h-6 rounded-md border-2 transition-all flex items-center justify-center",
                      notifications[item.id as keyof typeof notifications] 
                        ? "bg-zinc-900 border-zinc-900 text-white" 
                        : "border-zinc-200 bg-white"
                    )}
                  >
                    {notifications[item.id as keyof typeof notifications] && <Check className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Security & Access (Implicitly for simplicity) */}
        <Card className="border-zinc-200 shadow-sm opacity-60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-zinc-100">
                <Shield className="w-5 h-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">Account Security</p>
                <p className="text-xs text-zinc-500">Two-factor authentication and password management is currently managed by your administrator.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
        <Button 
          onClick={handleSave}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-zinc-200 transition-all active:scale-95"
        >
          {isSaved ? 'Settings Saved!' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
