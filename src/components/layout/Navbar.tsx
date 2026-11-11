import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { FileText, Plus, Database, Sparkles, Cpu } from 'lucide-react';
import { Button } from '../ui/button';
import { isConfigured } from '../../lib/supabase';
import { McpConnectModal } from '../mcp/McpConnectModal';

export function Navbar({ onOpenCreate }: { onOpenCreate?: () => void }) {
  const [isMcpOpen, setIsMcpOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/30">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-charcoal">
                  Propose<span className="text-primary">It</span>
                </span>
                <span className="text-[10px] -mt-1 font-semibold tracking-wider uppercase text-charcoal-subtle">
                  Freelancer Portal
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-200">
              <Link
                to="/"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-charcoal hover:bg-slate-100 hover:text-primary transition-colors [&.active]:bg-emerald-50 [&.active]:text-primary font-semibold"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          {/* Status indicator & Actions */}
          <div className="flex items-center gap-2.5">
            {/* Supabase connection pill */}
            <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-1 text-xs font-medium text-charcoal-muted">
              <Database className="h-3.5 w-3.5 text-emerald-600" />
              <span>DB: {isConfigured ? 'Supabase Live' : 'Demo Memory DB'}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </div>

            {/* AI-free badge ensuring strict compliance */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              <Sparkles className="h-3 w-3 text-slate-400" />
              <span>AI-Free Core</span>
            </div>

            {/* In-App MCP Connect Hub Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMcpOpen(true)}
              className="gap-1.5 text-xs h-9 text-charcoal border-slate-200 hover:bg-slate-50 font-semibold"
              title="Connect & Test MCP Server"
            >
              <Cpu className="h-3.5 w-3.5 text-emerald-700" />
              <span>MCP Connect</span>
            </Button>

            {onOpenCreate && (
              <Button
                onClick={onOpenCreate}
                size="sm"
                className="gap-1.5 shadow-sm h-9"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Proposal</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* In-App MCP Modal */}
      <McpConnectModal
        isOpen={isMcpOpen}
        onClose={() => setIsMcpOpen(false)}
      />
    </>
  );
}

