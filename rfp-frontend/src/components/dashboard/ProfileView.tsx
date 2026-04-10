'use client'

import { useState, useEffect } from 'react'
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  MapPin, 
  Calendar,
  Camera,
  Check,
  Globe,
  Twitter,
  Linkedin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from '@/lib/mocks/rfpData'
import { cn } from '@/lib/utils'

interface ProfileViewProps {
  userRole: 'pm' | 'architect'
}

export function ProfileView({ userRole }: ProfileViewProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('rfp_user')
    if (stored) {
      setUser(JSON.parse(stored))
    }
  }, [])

  if (!user) return null

  const handleSave = () => {
    setIsEditing(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarFallback className="bg-zinc-950 text-white text-3xl font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">{user.name}</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {user.role === 'pm' ? 'Project Manager' : 'Solution Architect'}
            </p>
          </div>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={cn(
            "h-11 px-6 rounded-xl font-bold transition-all active:scale-95",
            isEditing 
              ? "bg-blue-600 hover:bg-blue-700 text-white" 
              : "bg-zinc-900 hover:bg-zinc-800 text-white"
          )}
        >
          {isEditing ? 'Save Profile' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400">Full Name</Label>
                  {isEditing ? (
                    <Input defaultValue={user.name} className="h-11 rounded-lg border-zinc-200" />
                  ) : (
                    <p className="text-sm font-medium text-zinc-900">{user.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400">Email Address</Label>
                  {isEditing ? (
                    <Input defaultValue={user.email} className="h-11 rounded-lg border-zinc-200" />
                  ) : (
                    <p className="text-sm font-medium text-zinc-900">{user.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400">Department</Label>
                  <p className="text-sm font-medium text-zinc-900">Enterprise Sales Operations</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-400">Location</Label>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-900">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    San Francisco, CA
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Label className="text-xs font-bold text-zinc-400">Bio</Label>
                {isEditing ? (
                  <textarea 
                    className="w-full min-h-[100px] p-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
                    defaultValue="Leading strategic RFP responses for Fortune 500 clients with a focus on SaaS automation and compliance."
                  />
                ) : (
                  <p className="text-sm text-zinc-600 leading-relaxed">
                    Leading strategic RFP responses for Fortune 500 clients with a focus on SaaS automation and compliance.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Connected Accounts</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-zinc-100">
              {[
                { label: 'LinkedIn', icon: Linkedin, value: 'linkedin.com/in/jsmith' },
                { label: 'Twitter', icon: Twitter, value: '@jsmith_rfp' },
                { label: 'Personal Website', icon: Globe, value: 'jsmith.design' }
              ].map((account) => (
                <div key={account.label} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-50">
                      <account.icon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-sm font-medium text-zinc-900">{account.label}</span>
                  </div>
                  <span className="text-xs font-medium text-blue-600 hover:underline cursor-pointer">{account.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {[
                { label: 'RFPs Managed', value: '42' },
                { label: 'Success Rate', value: '89%' },
                { label: 'Avg Feedback', value: '4.8/5' }
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{stat.label}</p>
                  <p className="text-2xl font-black text-zinc-900">{stat.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {isSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-emerald-700">Profile saved successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
