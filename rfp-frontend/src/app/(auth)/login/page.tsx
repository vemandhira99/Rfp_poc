'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Zap, 
  Shield, 
  Users, 
  Briefcase, 
  UserCircle2,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'pm' | 'architect'>('pm')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const emailInput = (document.getElementById('email') as HTMLInputElement)?.value
    const passwordInput = (document.getElementById('password') as HTMLInputElement)?.value
    
    const emailToUse = emailInput || (role === 'architect' ? 'veman@company.com' : 'yash@company.com')
    const password = passwordInput || 'pm123'; // Default to pm123 for convenience if empty

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000' + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: emailToUse,
          password: password
        })
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      const data = await response.json();
      
      // Save token and user data
      localStorage.setItem('rfp_token', data.access_token);
      localStorage.setItem('rfp_user', JSON.stringify({
        id: data.user_id,
        name: data.name,
        role: role,
        email: emailToUse
      }));
      
      router.push(role === 'architect' ? '/dashboard/architect' : '/dashboard/ceo')
    } catch(err) {
      alert('Login failed. Ensure backend is running.');
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left Section - Project Info (Black) */}
      <div className="w-full md:w-1/2 bg-zinc-950 p-12 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Abstract background element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-black font-black text-xl italic">R</span>
            </div>
            <span className="text-xl font-bold tracking-tight">RFP Automation</span>
          </div>

          <div className="space-y-8 max-w-md">
            <h1 className="text-5xl font-bold leading-tight tracking-tighter">
              The Future of <br />
              <span className="text-zinc-400">RFP Responses.</span>
            </h1>
            <p className="text-lg text-zinc-400 font-medium leading-relaxed">
              Accelerate your sales cycle with our AI-powered RFP automation platform. 
              Built for high-growth enterprises to streamline compliance and collaboration.
            </p>

            <div className="space-y-6 pt-4">
              {[
                { icon: Zap, text: '60% faster response times with AI-driven drafting' },
                { icon: Shield, text: 'Real-time compliance tracking & risk assessment' },
                { icon: Users, text: 'Seamless collaboration for global pursuit teams' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="mt-1 p-1 rounded-md bg-zinc-800">
                    <item.icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-zinc-300 font-medium">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 inline-flex">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                  U{i}
                </div>
              ))}
            </div>
            <p className="text-xs text-zinc-400 font-medium">Joined by 500+ global enterprises this month</p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form (White) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-10">
          <div className="space-y-4">
            {/* Role Switcher */}
            <div className="inline-flex p-1 bg-zinc-100 rounded-xl w-full">
              <button 
                onClick={() => setRole('pm')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all",
                  role === 'pm' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <Briefcase className="w-4 h-4" />
                Project Manager
              </button>
              <button 
                onClick={() => setRole('architect')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all",
                  role === 'architect' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                )}
              >
                <UserCircle2 className="w-4 h-4" />
                Solution Architect
              </button>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                {role === 'pm' ? 'Project Manager Login' : 'Solution Architect Login'}
              </h2>
              <p className="text-zinc-500 font-medium text-sm">
                {role === 'pm' 
                  ? 'Sign in to review and manage all active RFPs' 
                  : 'Sign in to access your technical workspace and drafting tools'}
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder={role === 'pm' ? 'yash@company.com' : 'veman@company.com'} 
                required 
                className="h-12 border-zinc-200 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 rounded-xl px-4 py-6 text-base font-medium transition-all" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-zinc-400">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required 
                className="h-12 border-zinc-200 focus-visible:ring-zinc-900 focus-visible:border-zinc-900 rounded-xl px-4 py-6 text-base font-medium transition-all" 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg rounded-xl shadow-lg shadow-zinc-200 transition-all hover:scale-[1.01] active:scale-[0.99] group"
            >
              Sign in as {role === 'pm' ? 'Project Manager' : 'Solution Architect'}
              <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="pt-8 border-t border-zinc-100 space-y-4 text-center text-sm font-medium">
            <p className="text-zinc-400">
              Need assistance? <a href="#" className="text-zinc-900 font-bold hover:underline underline-offset-4 transition-all">Support Center</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
