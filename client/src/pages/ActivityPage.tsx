import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Visão geral', href: '/dashboard' },
  { label: 'Relatórios', href: '/reports' },
  { label: 'Mensagens', href: '/messages' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Configurações', href: '/settings' },
  { label: 'Perfil', href: '/profile' },
]

const ACTIVITY_ITEMS = [
  {
    id: 1,
    user: 'Ana Silva',
    action: 'Solicitação concluída',
    time: '2023-10-01 14:30',
    status: 'success',
  },
  {
    id: 2,
    user: 'Carlos Oliveira',
    action: 'Falha: Autenticação expirada',
    time: '2023-10-01 14:35',
    status: 'warning',
  },
  {
    id: 3,
    user: 'Mariana Souza',
    action: 'Solicitação concluída',
    time: '2023-10-01 14:40',
    status: 'success',
  },
  {
    id: 4,
    user: 'Tiago Costa',
    action: 'Falha: Servidor indisponível',
    time: '2023-10-01 14:45',
    status: 'warning',
  },
  {
    id: 5,
    user: 'Luciana Ferreira',
    action: 'Solicitação concluída',
    time: '2023-10-01 14:50',
    status: 'success',
  },
]

export default function ActivityPage() {
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
              variant={item.href === '/activity' ? 'default' : 'outline'}
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
            <h1 className="text-2xl font-bold">Atividade recente</h1>
            <p className="text-muted-foreground text-sm">
              Veja o histórico de atividades no sistema.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-4 md:hidden" />
              <span className="hidden md:inline">Menu</span>
            </Button>
          </div>
        </header>

        {/* Activity Feed */}
        <Card className="rounded-3xl mb-6">
          <CardHeader>
            <CardTitle>Atividade recente</CardTitle>
            <CardDescription>Veja as atividades mais recentes no sistema.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 py-2">
            <div className="space-y-3">
              {ACTIVITY_ITEMS.map((item) => (
                <div key={item.id} className="border-b border-border/20 py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'size-6 rounded-full flex items-center justify-center',
                        item.status === 'success'
                          ? 'bg-success/10'
                          : item.status === 'warning'
                            ? 'bg-warning/10'
                            : 'bg-muted'
                      )}
                    >
                      {item.status === 'success' ? (
                        <CheckCircle2 className="size-4 text-success" />
                      ) : item.status === 'warning' ? (
                        <Clock className="size-4 text-warning" />
                      ) : (
                        <X className="size-4 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.user}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

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
            className={item.href === '/activity' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          >
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  )
}