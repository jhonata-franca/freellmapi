import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  ChevronRight,
  Clock,
  CreditCard,
  Menu,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const REPORTS = [
  {
    title: 'Performance do Mês',
    description: 'Análise de tendências de requests e latência',
    value: '85%',
    unit: '%',
    icon: BarChart3,
    color: 'text-primary',
  },
  {
    title: 'Economia Estimada',
    description: 'Economia com base em uso e custos',
    value: 'R$ 1.250,00',
    unit: 'BRL',
    icon: CreditCard,
    color: 'text-success',
  },
  {
    title: 'Taxa de Sucesso',
    description: 'Requisições bem-sucedidas',
    value: '94.5%',
    unit: '%',
    icon: ShieldCheck,
    color: 'text-success',
  },
  {
    title: 'Latência Média',
    description: 'Tempo médio de resposta',
    value: '312ms',
    unit: 'ms',
    icon: Clock,
    color: 'text-warning',
  },
]

const NAV_ITEMS = [
  { label: 'Visão geral', href: '/dashboard' },
  { label: 'Relatórios', href: '/reports' },
  { label: 'Mensagens', href: '/messages' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Configurações', href: '/settings' },
  { label: 'Perfil', href: '/profile' },
]

export default function ReportsPage() {
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
              variant={item.href === '/reports' ? 'default' : 'outline'}
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
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground text-sm">
              Resumo dos relatórios gerados pelo sistema.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-4 md:hidden" />
              <span className="hidden md:inline">Menu</span>
            </Button>
            <Button variant="default" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="size-4" /> Atualizar dados
            </Button>
          </div>
        </header>

        {/* Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {REPORTS.map((report) => {
            const Icon = report.icon
            return (
              <Card key={report.title} className="rounded-3xl border border-border/50">
                <CardHeader className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-medium">{report.title}</CardTitle>
                      <CardDescription className="text-xs">{report.description}</CardDescription>
                    </div>
                    <div className="size-8 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Icon className={cn('size-4', report.color)} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 py-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums">{report.value}</span>
                    <span className="text-muted-foreground text-sm">{report.unit}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Novo relatório', icon: BarChart3, href: '/reports', color: 'bg-primary text-primary-foreground' },
            { label: 'Enviar mensagem', icon: RefreshCw, href: '/messages', color: 'bg-secondary text-secondary-foreground' },
            { label: 'Configurações', icon: RefreshCw, href: '/settings', color: 'bg-muted text-muted-foreground' },
            { label: 'Atualizar dados', icon: RefreshCw, href: '/sync', color: 'bg-accent text-accent-foreground' },
          ].map((action) => (
            <Button
              key={action.label}
              onClick={() => navigate(action.href)}
              variant="outline"
              size="sm"
              className={cn('w-full flex flex-row items-center justify-between gap-3 text-left rounded-xl', action.color)}
            >
              <div className="flex items-center gap-2">
                <action.icon className="size-4" />
                <span>{action.label}</span>
              </div>
              <ChevronRight className="size-3 opacity-50" />
            </Button>
          ))}
        </section>
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
            className={item.href === '/reports' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          >
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  )
}