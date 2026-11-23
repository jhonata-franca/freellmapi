import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  Send,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Visão geral', href: '/dashboard' },
  { label: 'Relatórios', href: '/reports' },
  { label: 'Mensagens', href: '/messages' },
  { label: 'Analytics', href: '/analytics' },
  { label: 'Configurações', href: '/settings' },
  { label: 'Perfil', href: '/profile' },
]

export default function MessagesPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [message, setMessage] = useState('')

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
              variant={item.href === '/messages' ? 'default' : 'outline'}
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
            <h1 className="text-2xl font-bold">Mensagens</h1>
            <p className="text-muted-foreground text-sm">
              Envie mensagens ou visualize o histórico.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              <Menu className="size-4 md:hidden" />
              <span className="hidden md:inline">Menu</span>
            </Button>
          </div>
        </header>

        {/* Send Message Form */}
        <Card className="rounded-3xl mb-6">
          <CardHeader>
            <CardTitle>Enviar Nova Mensagem</CardTitle>
            <CardDescription>Preencha os campos abaixo para enviar uma mensagem.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium">
                  Destinatário
                </label>
                <Input
                  id="recipient"
                  placeholder="ex: usuario@email.com ou nome do canal"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Assunto
                </label>
                <Input
                  id="subject"
                  placeholder="Assunto da mensagem"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Mensagem
                </label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  rows={6}
                  className="w-full"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                <Send className="size-4 mr-2" /> Enviar Mensagem
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Message History Placeholder */}
        <Card className="rounded-3xl">
          <CardHeader>
            <CardTitle>Histórico de Mensagens</CardTitle>
            <CardDescription>Suas mensagens enviadas aparecerão aqui.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Send className="size-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Nenhuma mensagem enviada ainda.</p>
              <p className="text-xs mt-1">Envie sua primeira mensagem acima.</p>
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
            className={item.href === '/messages' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}
          >
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </nav>
    </div>
  )
}