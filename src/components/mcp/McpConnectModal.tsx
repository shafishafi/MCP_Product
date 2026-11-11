import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProposal, isConfigured } from '../../lib/supabase';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Copy,
  Check,
  X,
  Sparkles,
  Bot,
  IndianRupee,
  Cpu,
  Layers,
  Code2,
  CheckCircle2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function McpConnectModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulate'>('guide');
  const [guideSubTab, setGuideSubTab] = useState<'claude' | 'cursor' | 'terminal'>('claude');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // In-app MCP simulator form state
  const [clientName, setClientName] = useState('Zomato Media Ltd');
  const [price, setPrice] = useState('180000');
  const [scopeOfWork, setScopeOfWork] = useState(
    'Redesign of customer delivery tracking interface, animated micro-interactions in Framer Motion, and mobile responsiveness audit.'
  );
  const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useUIStore();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      return createProposal({
        client_name: clientName.trim(),
        price: parseFloat(price) || 0,
        status: 'draft',
        scope_of_work: scopeOfWork.trim(),
      });
    },
    onSuccess: (newProp) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setLastGeneratedId(newProp.id);
      notifySuccess(
        'MCP Proposal Created!',
        `"create_proposal" successfully created a proposal for ${newProp.client_name}.`
      );
    },
    onError: (err: Error) => {
      notifyError('MCP Simulation Failed', err.message);
    },
  });

  if (!isOpen) return null;

  const mcpServerAbsolutePath = '/Users/shafi/prop/mcp-server/dist/index.js';

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        proposeit: {
          command: 'node',
          args: [mcpServerAbsolutePath],
        },
      },
    },
    null,
    2
  );

  const cursorCommand = `node ${mcpServerAbsolutePath}`;
  const terminalTestCmd = `cd /Users/shafi/prop/mcp-server && npm run test:create`;

  const copyToClipboard = (text: string, key: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopiedKey(key);
      notifySuccess('Copied to Clipboard');
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      notifyError('Failed to copy to clipboard');
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-popover border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-primary border border-emerald-200/80 shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-charcoal">MCP Integration Hub</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Model Context Protocol
                </span>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Connect your AI agent or simulate MCP tool calls directly in the app.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-charcoal hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Connect Your AI Agent</span>
          </button>
          <button
            onClick={() => setActiveTab('simulate')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'simulate'
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>In-App Tool Simulator</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {activeTab === 'guide' ? (
            <div className="space-y-5">
              {/* Common Env Notice */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-charcoal space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Unified Common Environment
                  </span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                    /Users/shafi/prop/.env
                  </span>
                </div>
                <p className="text-charcoal-muted leading-relaxed">
                  Both this web app and the MCP server share the exact same root <code className="bg-slate-200/70 text-charcoal px-1.5 py-0.5 rounded font-mono">.env</code> file. No duplicate keys or separate setup required!
                </p>
              </div>

              {/* Sub-tabs for platforms */}
              <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
                {(['claude', 'cursor', 'terminal'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setGuideSubTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      guideSubTab === tab
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-charcoal-muted hover:text-charcoal'
                    }`}
                  >
                    {tab === 'claude'
                      ? 'Claude Desktop'
                      : tab === 'cursor'
                      ? 'Cursor IDE'
                      : 'Terminal (CLI)'}
                  </button>
                ))}
              </div>

              {/* Platform specific guides */}
              {guideSubTab === 'claude' && (
                <div className="space-y-3">
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    <strong>Step 1:</strong> Open your Claude Desktop configuration file:
                    <br />
                    <code className="text-[11px] font-mono bg-slate-100 text-charcoal px-2 py-0.5 rounded block mt-1 select-all">
                      ~/Library/Application Support/Claude/claude_desktop_config.json
                    </code>
                  </div>
                  <div className="text-xs text-charcoal-muted">
                    <strong>Step 2:</strong> Add this snippet to the <code className="font-mono text-charcoal font-semibold">"mcpServers"</code> section:
                  </div>
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {claudeDesktopConfig}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(claudeDesktopConfig, 'claude')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
                    >
                      {copiedKey === 'claude' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy JSON</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-charcoal-muted pt-1 leading-relaxed">
                    <strong>Step 3:</strong> Restart Claude Desktop. The hammer icon 🔨 will appear with <code className="font-mono text-primary font-bold">create_proposal</code> enabled!
                  </div>
                </div>
              )}

              {guideSubTab === 'cursor' && (
                <div className="space-y-3">
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    <strong>Step 1:</strong> Open <strong>Cursor Settings</strong> (<code className="font-mono bg-slate-100 px-1 rounded">Cmd + ,</code>) → go to <strong>Features</strong> → <strong>MCP</strong>.
                  </div>
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    <strong>Step 2:</strong> Click <strong>+ Add New MCP Server</strong>:
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Name: <code className="font-mono bg-slate-100 px-1 rounded">proposeit</code></li>
                      <li>Type: <code className="font-mono bg-slate-100 px-1 rounded">command</code></li>
                      <li>Command: Use the exact command below</li>
                    </ul>
                  </div>
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {cursorCommand}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(cursorCommand, 'cursor')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
                    >
                      {copiedKey === 'cursor' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Command</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {guideSubTab === 'terminal' && (
                <div className="space-y-3">
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    Test the MCP server directly from your macOS terminal using the built-in runner:
                  </div>
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {terminalTestCmd}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(terminalTestCmd, 'terminal')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
                    >
                      {copiedKey === 'terminal' ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Command</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* In-App Tool Simulator Tab */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>In-App Simulation:</strong> Emulate what happens when an AI assistant invokes the <code className="font-mono font-bold">create_proposal</code> MCP tool right here in your browser.
              </div>

              {lastGeneratedId && (
                <div className="p-3.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                    <span>
                      Generated ID: <strong className="font-mono">{lastGeneratedId}</strong>
                    </span>
                  </div>
                  <a
                    href={`/edit/${lastGeneratedId}`}
                    className="font-bold text-primary underline hover:text-emerald-800"
                  >
                    Open in Editor →
                  </a>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
                  Client Name (parameter: clientName)
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Swiggy Ltd"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                  Proposed Price in INR (parameter: price)
                </label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="180000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
                  Scope of Work (parameter: scopeOfWork)
                </label>
                <Textarea
                  rows={4}
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  placeholder="Deliverables and milestones..."
                />
              </div>

              {/* JSON-RPC Preview */}
              <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                  <Code2 className="h-3 w-3" /> JSON-RPC Payload Preview
                </div>
                {JSON.stringify(
                  {
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                      name: 'create_proposal',
                      arguments: {
                        clientName: clientName.trim() || '...',
                        price: parseFloat(price) || 0,
                        scopeOfWork: scopeOfWork.trim() || '...',
                      },
                    },
                  },
                  null,
                  2
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => simulateMutation.mutate()}
                  disabled={simulateMutation.isPending}
                  className="gap-2 shadow-sm font-semibold"
                >
                  <Bot className="h-4 w-4" />
                  <span>
                    {simulateMutation.isPending
                      ? 'Executing MCP Tool...'
                      : 'Execute Tool Call'}
                  </span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs text-charcoal-muted">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isConfigured ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <span>Database: {isConfigured ? 'Supabase Live' : 'Demo Local File Sync'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
