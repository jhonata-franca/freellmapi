import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  User,
  CheckCircle2,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Visão geral', href: '/dashboard' },
  { label: 'Relatórios', href: '/reports' },
  { label: 'Mensagens', href: '/messages' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Configurações', href: '/settings' },
  { label: 'Perfil', href: '/profile' },
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:hidden'
        )}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <h1 className="text-lg font-bold">Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="size-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant={item.href === '/profile' ? 'default' : 'outline'}
              size="default"
              className="w-full text-left justify-start"
              onClick={() => {
                setSidebarOpen(false)
                navigate(item.href)
              }}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
            <p className="text-muted-foreground text-sm">
              Gerencie suas configurações pessoais e preferências de conta.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-4 md:hidden" />
              <span className="hidden md:inline">Menu</span>
            </Button>
          </div>
        </header>

        {/* Profile Card */}
        <Card className="rounded-3xl mb-6">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Gerencie as configurações da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="size-5 text-muted-foreground" />
              <div>
                <h3 className="text-sm font-medium">Nome</h3>
                <p className="text-xs text-muted-foreground">Seu nome completo</p>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="size-5 text-success" />
                <p className="text-xs text-muted-foreground">Conta ativa</p>
              </div>
              <div className="flex items-center gap-3">
                <Settings className="size-5" />
                <p className="text-xs text-muted-foreground">Acesso a configurações avançadas.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
            <CardDescription>Veja as atividades recentes da sua conta.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="size-6 rounded-full bg-mutated" />
                <p className="text-sm font-medium">Ana Silva</p>
                <p className="text-xs text-muted-foreground">Solicitação concluída</p>
                <span className="text-xs text-muted-foreground">2023-10-01 14:30</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="size-6 rounded-full bg-mutated" />
                <p className="text-sm font-medium">Carlos Oliveira</p>
                <p className="text-xs text-muted-foreground">Falha: Autenticação expirada</p>
                <span className="text-xs text-muted-foreground">2023-10-01 14:35</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Bottom Navigation */}
        <nav
          className={cn(
            'fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around px-4 py-3',
            'md:hidden'
        )}
      >
        {NAV_ITEMS.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate(item.href)}
            className={item.href === '/profile' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          >
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </nav>
      </main>
    </div>
  )
}