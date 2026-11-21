import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  BarChart3,
  Bolt,
  ChevronRight,
  CreditCard,
  Mail,
  Menu,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import {
  getAnalyticsSummary,
  getRecentRequests,
  getTimeline,
  getByPlatform,
  type AnalyticsSummary,
  type RecentRequest,
  type TimelineItem,
  type ByPlatformItem,
} from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

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
  const TrendIcon = trend === 'up' ? TrendingUp : X
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
            <TrendIcon className="size-3" /> {change}
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

type TimeRange = '7d' | '30d' | '90d'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d', label: 'Últimos 7 dias' },
  { value: '30d', label: 'Últimos 30 dias' },
  { value: '90d', label: 'Últimos 90 dias' },
]

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const navigate = useNavigate()

  const [stats, setStats] = useState<AnalyticsSummary | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [byPlatform, setByPlatform] = useState<ByPlatformItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [summary, requests, timelineData, platformData] = await Promise.all([
          getAnalyticsSummary(timeRange),
          getRecentRequests(timeRange, 5),
          getTimeline(timeRange, timeRange === '7d' ? 'hour' : 'day'),
          getByPlatform(timeRange),
        ])
        setStats(summary)
        setRecentRequests(requests.rows)
        setTimeline(timelineData)
        setByPlatform(platformData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [timeRange])

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
            <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
              <SelectTrigger size="sm" className="w-auto min-w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-3xl bg-muted/50 p-4 text-center">
              <span className="text-muted-foreground animate-pulse text-lg">Carregando...</span>
            </div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Usuários ativos"
              value={stats.totalRequests.toLocaleString()}
              change="+8%"
              trend="up"
              Icon={User}
              color="text-primary"
            />
            <StatCard
              title="Receita mensal"
              value={stats.estimatedCostSavings.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
              change="+12%"
              trend="up"
              Icon={CreditCard}
              color="text-primary"
            />
            <StatCard
              title="Sessões hoje"
              value={stats.totalRequests.toLocaleString()}
              change="-3%"
              trend="down"
              Icon={Activity}
              color="text-destructive"
            />
            <StatCard
              title="Taxa de erro"
              value={`${(stats.successRate * 100).toFixed(1)}%`}
              change="-15%"
              trend="down"
              Icon={ShieldCheck}
              color="text-success"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-3xl bg-muted/50 p-4 text-center">
              <span className="text-muted-foreground">Erro ao carregar</span>
            </div>
          </div>
        )}

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
                {isLoading ? (
                  <div className="col-span-1 rounded-xl bg-muted/50 p-3 text-center animate-pulse">
                    <span className="text-xs text-muted-foreground">Carregando...</span>
                  </div>
                ) : (
                  QUICK_ACTIONS.map((action) => (
                    <QuickAction key={action.label} {...action} />
                  ))
                )}
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
                  {isLoading ? (
                    <p className="p-3 text-xs text-muted-foreground">Carregando atividade...</p>
                  ) : recentRequests.length > 0 ? (
                    recentRequests.map((req) => (
                      <ActivityItem
                        key={req.id}
                        user={req.keyLabel ?? 'Anônimo'}
                        action={req.status === 'success' ? 'Solicitação concluída' : `Falha: ${req.error ?? 'erro desconhecido'}`}
                        time={req.createdAt ? new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'agora'}
                        avatar={(req.clientIp ?? 'AN').slice(0, 2).toUpperCase()}
                        status={req.status === 'success' ? 'success' : 'warning'}
                      />
                    ))
                  ) : (
                    <p className="p-3 text-xs text-muted-foreground">Sem atividade recente</p>
                  )}
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
                      {isLoading ? (
                        <p className="p-3 text-xs text-muted-foreground">Carregando logs...</p>
                      ) : recentRequests.length > 0 ? (
                        recentRequests.map((req) => (
                          <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="size-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                  {(req.clientIp ?? 'AN').slice(0, 2).toUpperCase()}
                                </span>
                                <span className="font-medium">{req.keyLabel ?? 'Anônimo'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">{req.status === 'success' ? 'Solicitação concluída' : 'Falha'}</td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(req.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={req.status === 'success' ? 'default' : 'outline'}>
                                {req.status === 'success' ? 'Concluído' : 'Erro'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <p className="p-3 text-xs text-muted-foreground">Sem logs de atividade</p>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="performance" className="mt-4 space-y-6">
              <section>
                <h2 className="text-sm font-semibold mb-4">Métricas de performance</h2>
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="rounded-3xl bg-muted/50 p-6 text-center animate-pulse">
                      <span className="text-muted-foreground">Carregando...</span>
                    </div>
                    <div className="rounded-3xl bg-muted/50 p-6 text-center animate-pulse">
                      <span className="text-muted-foreground">Carregando...</span>
                    </div>
                    <div className="rounded-3xl bg-muted/50 p-6 text-center animate-pulse">
                      <span className="text-muted-foreground">Carregando...</span>
                    </div>
                  </div>
                ) : stats ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle>Tempo de resposta médio</CardTitle>
                          <CardDescription>Latência média das requisições</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tabular-nums text-primary">
                              {stats.avgLatencyMs}
                            </span>
                            <span className="text-muted-foreground text-sm">ms</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            P50: {stats.p50LatencyMs ?? 'N/A'}ms • P95: {stats.p95LatencyMs ?? 'N/A'}ms
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle>Taxa de sucesso</CardTitle>
                          <CardDescription>Requisições bem-sucedidas</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tabular-nums text-success">
                              {(stats.successRate * 100).toFixed(1)}
                            </span>
                            <span className="text-muted-foreground text-sm">%</span>
                          </div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            {stats.totalRequests.toLocaleString()} requisições no período
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-3xl">
                        <CardHeader>
                          <CardTitle>TTFB médio</CardTitle>
                          <CardDescription>Time to First Byte</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tabular-nums text-secondary">
                              {stats.avgTtfbMs ?? 'N/A'}
                            </span>
                            <span className="text-muted-foreground text-sm">ms</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timeline Chart */}
                    <section>
                      <h3 className="text-sm font-semibold mb-3">Volume de requisições ao longo do tempo</h3>
                      <Card className="rounded-3xl">
                        <CardContent className="pt-0 pb-4">
                          <div className="h-48 w-full flex items-end gap-1 px-2">
                            {timeline.length > 0 ? (
                              timeline.slice(-24).map((item, i) => (
                                <div
                                  key={i}
                                  className="flex-1 bg-primary/60 rounded-t-sm transition-all hover:bg-primary hover:scale-105"
                                  style={{ height: `${Math.max((item.requests / Math.max(...timeline.slice(-24).map(t => t.requests), 1)) * 100, 4)}%` }}
                                  title={`${new Date(item.timestamp).toLocaleDateString('pt-BR')}: ${item.requests} req`}
                                />
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Sem dados de timeline</span>
                            )}
                          </div>
                          <div className="flex justify-between px-2 text-xs text-muted-foreground mt-2">
                            {timeline.length > 0 && (
                              <>
                                <span>{new Date(timeline[0].timestamp).toLocaleDateString('pt-BR')}</span>
                                <span>{new Date(timeline[timeline.length - 1].timestamp).toLocaleDateString('pt-BR')}</span>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </section>

                    {/* By Platform */}
                    <section>
                      <h3 className="text-sm font-semibold mb-3">Performance por plataforma</h3>
                      <Card className="rounded-3xl">
                        <CardContent className="pt-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                                  <th className="px-4 py-3">Plataforma</th>
                                  <th className="px-4 py-3 text-right">Requisições</th>
                                  <th className="px-4 py-3 text-right">Taxa sucesso</th>
                                  <th className="px-4 py-3 text-right">Latência média</th>
                                  <th className="px-4 py-3 text-right">P95 Latência</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {byPlatform.length > 0 ? (
                                  byPlatform.map((platform) => (
                                    <tr key={`${platform.platform}-${platform.providerId}`} className="hover:bg-muted/30 transition-colors">
                                      <td className="px-4 py-3 font-medium">{platform.platform} ({platform.providerId})</td>
                                      <td className="px-4 py-3 text-right tabular-nums">{platform.requests.toLocaleString()}</td>
                                      <td className="px-4 py-3 text-right">
                                        <span className={cn('font-medium', platform.successRate >= 0.95 ? 'text-success' : platform.successRate >= 0.8 ? 'text-warning' : 'text-destructive')}>
                                          {(platform.successRate * 100).toFixed(1)}%
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{platform.avgLatencyMs}ms</td>
                                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">{platform.p95LatencyMs ?? 'N/A'}ms</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td className="px-4 py-3 text-center text-muted-foreground" colSpan={5}>Sem dados de plataforma</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  </>
                ) : (
                  <div className="rounded-3xl bg-muted/50 p-6 text-center">
                    <span className="text-muted-foreground">Erro ao carregar métricas</span>
                  </div>
                )}
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

