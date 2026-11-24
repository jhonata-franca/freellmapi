import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  X,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Visão geral', href: '/dashboard' },
  { label: 'Relatórios', href: '/reports' },
  { label: 'Mensagens', href: '/messages' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Configurações', href: '/settings' },
  { label: 'Perfil', href: '/profile' },
]

export default function SyncPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [synced, setSynced] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    setSynced(false)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSynced(true)
    } finally {
      setSyncing(false)
    }
  }

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
              variant={item.href === '/sync' ? 'default' : 'outline'}
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
            <h1 className="text-2xl font-bold">Atualizar Dados</h1>
            <p className="text-muted-foreground text-sm">
              Sincronize os dados do dashboard com o servidor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-4 md:hidden" />
              <span className="hidden md:inline">Menu</span>
            </Button>
          </div>
        </header>

        {/* Sync Card */}
        <Card className="rounded-3xl mb-6">
          <CardHeader>
            <CardTitle>Sincronização de Dados</CardTitle>
            <CardDescription>Atualize os dados do dashboard com as informações mais recentes do servidor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleSync}
              disabled={syncing || synced}
              variant={synced ? 'default' : 'outline'}
              size="default"
              className="w-full sm:w-auto"
            >
              {syncing ? (
                <>
                  <RefreshCw className="size-5 animate-spin mr-2" /> Sincronizando...
                </>
              ) : synced ? (
                <>
                  <CheckCircle2 className="size-5 mr-2" /> Sincronizado
                </>
              ) : (
                <>
                  <RefreshCw className="size-5 mr-2" /> Sincronizar Agora
                </>
              )}
            </Button>
            {synced && (
              <div className="flex items-center gap-3 text-success text-sm font-medium">
                <CheckCircle2 className="size-4" />
                <span>Os dados foram sincronizados com sucesso.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Info Card */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Informações de Sincronização</CardTitle>
            <CardDescription>Detalhes sobre a sincronização de dados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Última sincronização:</span>
              <span>{synced ? new Date().toLocaleString('pt-BR') : 'Nunca'}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frequência:</span>
              <span>Automática (a cada 5 minutos)</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Fontes de dados:</span>
              <span>API do servidor</span>
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
            className={item.href === '/sync' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          >
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  )
}