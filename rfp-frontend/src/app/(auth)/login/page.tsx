'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    const emailInput = (document.getElementById('email') as HTMLInputElement)?.value
    
    const isArchitect = emailInput === 'alex@company.com'
    const user = isArchitect 
      ? { id: 'u2', name: 'Alex Johnson', initials: 'SA', role: 'architect', email: 'alex@company.com' }
      : { id: 'u1', name: 'Jennifer Smith', initials: 'PM', role: 'pm', email: 'jennifer@company.com' }
      
    localStorage.setItem('rfp_user', JSON.stringify(user))
    
    router.push(isArchitect ? '/dashboard/architect' : '/dashboard/ceo')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-zinc-200">
        <CardHeader className="space-y-1 text-center pb-8 border-b border-zinc-100">
          <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Sign in</CardTitle>
          <p className="text-sm text-zinc-500">Enter your credentials to access the RFP platform</p>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" required className="h-11" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Forgot password?
                </a>
              </div>
              <Input id="password" type="password" required className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-base shadow-sm">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
