import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bolt,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Mail,
  Menu,
  MenuIcon,
  Phone,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Star,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ── Mock data ────────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    title: 'Usuários ativos',
    value: '12.4k',
    change: '+12%',
    trend: 'up',
    icon: User,
    color: 'text-primary',
  },
  {
    title: 'Receita mensal',
    value: 'R$ 84.2k',
    change: '+8%',
    trend: 'up',
    icon: CreditCard,
    color: 'text-primary',
  },
  {
    title: 'Sessões hoje',
    value: '3.2k',
    change: '-3%',
    trend: 'down',
    icon: Activity,
    color: 'text-destructive',
  },
  {
    title: 'Taxa de erro',
    value: '0.4%',
    change: '-15%',
    trend: 'down',
    icon: ShieldCheck,
    color: 'text-success',
  },
]

const RECENT_ACTIVITY = [
  {
    id: '1',
    user: 'Ana Silva',
    action: 'criou um novo projeto',
    time: '2 min',
    avatar: 'AS',
    status: 'success',
  },
  {
    id: '2',
    user: 'Carlos Souza',
    action: 'atualizou configurações',
    time: '15 min',
    avatar: 'CS',
    status: 'info',
  },
  {
    id: '3',
    user: 'Maria Oliveira',
    action: 'excluiu um relatório',
    time: '1 h',
    avatar: 'MO',
    status: 'warning',
  },
  {
    id: '4',
    user: 'João Pereira',
    action: 'fez login no sistema',
    time: '3 h',
    avatar: 'JP',
    status: 'success',
  },
]

const QUICK_ACTIONS = [
  {
    label: 'Novo relatório',
    icon: BarChart3,
    href: '/reports',
    color: 'bg-primary text-primary-foreground',
  },
  {
    label: 'Enviar mensagem',
    icon: Send,
    href: '/messages',
    color: 'bg-secondary text-secondary-foreground',
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/settings',
    color: 'bg-muted text-muted-foreground',
  },
  {
    label: 'Atualizar dados',
    icon: RefreshCw,
    href: '/sync',
    color: 'bg-accent text-accent-foreground',
  },
]

// ── Components ───────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  change,
  trend,
  Icon,
  color,
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  Icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  const trendIcon = trend === 'up' ? TrendingUp : X
  return (
    <Card className="rounded-3xl border border-border/50">
      <CardHeader className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <CardDescription className="text-xs">{change} este mês</CardDescription>
          </div>
          <div className="size-8 rounded-xl bg-muted/50 flex items-center justify-center">
            <Icon className={cn('size-4', color)} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-2">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">{value}</span>
          <span className={cn('text-xs font-medium', trend === 'up' ? 'text-success' : 'text-destructive')}>
            <trendIcon className="size-3" /> {change}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ActivityItem({
  user,
  action,
  time,
  avatar,
  status,
}: {
  user: string
  action: string
  time: string
  avatar: string
  status: 'success' | 'info' | 'warning'
}) {
  const statusConfig = {
    success: { color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
    info: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    warning: { color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  }[status]

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-colors hover:bg-muted/50">
      <div className={cn('size-8 rounded-full flex items-center justify-center font-medium text-xs', statusConfig.bg, statusConfig.color)}>
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user}</p>
        <p className="text-xs text-muted-foreground truncate">{action}</p>
      </div>
      <span className={cn('text-xs', statusConfig.color)}>{time}</span>
    </div>
  )
}

function QuickAction({ label, icon: Icon, href, color }: { label: string; icon: React.ComponentType<{ className?: string }>; href: string; color: string }) {
  const navigate = useNavigate()
  return (
    <Button
      onClick={() => navigate(href)}
      variant="outline"
      size="sm"
      className={cn('w-full flex flex-row items-center justify-between gap-3 text-left rounded-xl', color)}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4" />
        <span>{label}</span>
      </div>
      <ChevronRight className="size-3 opacity-50" />
    </Button>
  )
}

// ── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const navigate = useNavigate()

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
          <Button
            variant="default"
            size="default"
            className="w-full text-left justify-start bg-primary text-primary-foreground"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/dashboard')
            }}
          >
            Visão geral
          </Button>
          <Button
            variant="outline"
            size="default"
            className="w-full text-left justify-start"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/reports')
            }}
          >
            Relatórios
          </Button>
          <Button
            variant="outline"
            size="default"
            className="w-full text-left justify-start"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/analytics')
            }}
          >
            Analytics
          </Button>
          <Button
            variant="outline"
            size="default"
            className="w-full text-left justify-start"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/settings')
            }}
          >
            Configurações
          </Button>
        </nav>
        <div className="p-4 border-t border-border">
          <Button
            variant="outline"
            size="default"
            className="w-full text-left justify-start gap-3"
            onClick={() => {
              setSidebarOpen(false)
              navigate('/profile')
            }}
          >
            <User className="size-4" />
            <span>Perfil</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Bem-vindo de volta. Aqui está um resumo da sua atividade.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-4 md:hidden" />
              <span className="hidden md:inline">Menu</span>
            </Button>
            <Button variant="default" size="sm">
              <Plus className="size-4" /> Novo
            </Button>
          </div>
        </header>

        {/* Stats Cards - Grid responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map((card, idx) => (
            <StatCard key={idx} {...card} />
          ))}
        </div>

        <Separator />

        {/* Tabs Section */}
        <div className="mt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 rounded-2xl bg-muted p-1">
              <TabsTrigger value="overview" className="text-sm font-medium">
                Visão geral
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-sm font-medium">
                Atividade
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-sm font-medium">
                Performance
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-sm font-medium">
                Configurações
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-6">
              {/* Quick Actions */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <QuickAction key={action.label} {...action} />
                ))}
              </section>

              {/* Recent Activity */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold">Atividade recente</h2>
                  <Link to="/activity" className="text-xs font-medium text-primary hover:underline">
                    Ver tudo
                  </Link>
                </div>
                <div className="space-y-1 rounded-2xl border border-border bg-card p-1">
                  {RECENT_ACTIVITY.map((item) => (
                    <ActivityItem key={item.id} {...item} />
                  ))}
                </div>
              </section>
            </TabsContent>

            <TabsContent value="activity" className="mt-4 space-y-6">
              <section>
                <h2 className="text-sm font-semibold mb-4">Logs de atividade</h2>
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                        <th className="px-4 py-3">Usuário</th>
                        <th className="px-4 py-3">Ação</th>
                        <th className="px-4 py-3">Hora</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {RECENT_ACTIVITY.map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                {item.avatar}
                              </span>
                              <span className="font-medium">{item.user}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.action}</td>
                          <td className="px-4 py-3 text-muted-foreground">{item.time}</td>
                          <td className="px-4 py-3">
                            <Badge variant={item.status === 'success' ? 'default' : item.status === 'info' ? 'secondary' : 'outline'}>
                              {item.status === 'success' ? 'Concluído' : item.status === 'info' ? 'Processando' : 'Pendente'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="performance" className="mt-4 space-y-6">
              <section>
                <h2 className="text-sm font-semibold mb-4">Métricas de performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Tempo de resposta</CardTitle>
                      <CardDescription>Média dos últimos 30 dias</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tabular-nums">142</span>
                        <span className="text-muted-foreground text-sm">ms</span>
                      </div>
                      <div className="mt-4 h-24 w-full">
                        {/* Simple bar representation */}
                        <div className="flex h-full gap-1">
                          {[65, 80, 72, 90, 85, 142, 110].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary rounded-t-sm" style={{ height: `${(h / 142) * 100}%` }} />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="rounded-3xl">
                    <CardHeader>
                      <CardTitle>Uptime</CardTitle>
                      <CardDescription>Disponibilidade do serviço</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold tabular-nums">99.9</span>
                        <span className="text-muted-foreground text-sm">%</span>
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-success" />
                        <span className="text-success font-medium">Sistemas operacionais</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="settings" className="mt-4 space-y-6">
              <section className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold mb-4">Preferências</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Notificações</h3>
                      <p className="text-xs text-muted-foreground">Receba notificações em tempo real</p>
                    </div>
                    <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium">Modo escuro</h3>
                      <p className="text-xs text-muted-foreground">Alterne entre tema claro e escuro</p>
                    </div>
                    <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
                  </div>
                </div>
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-md flex items-center justify-around px-4 py-3',
          'md:hidden'
        )}
      >
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/dashboard')} className="bg-primary text-primary-foreground">
          <BarChart3 className="size-5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/reports')} className="text-muted-foreground hover:text-foreground">
          <Mail className="size-5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/analytics')} className="text-muted-foreground hover:text-foreground">
          <Bolt className="size-5" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/settings')} className="text-muted-foreground hover:text-foreground">
          <Settings className="size-5" />
        </Button>
      </nav>
    </div>
  )
}

