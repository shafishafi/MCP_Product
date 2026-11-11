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
  Terminal,
  FileCode,
  ExternalLink,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type GuidePlatform = 'claude-desktop' | 'cursor' | 'claude-code' | 'windsurf' | 'terminal';

export function McpConnectModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'guide' | 'simulate' | 'tools'>('guide');
  const [guidePlatform, setGuidePlatform] = useState<GuidePlatform>('claude-desktop');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // In-app MCP simulator form state
  const [clientName, setClientName] = useState('Swiggy Delivery Platform');
  const [price, setPrice] = useState('180000');
  const [scopeOfWork, setScopeOfWork] = useState(
    'Architecture and implementation of live real-time order tracking dashboard, delivery partner route visualization, and mobile UX revamp.'
  );
  const [simulatedResponse, setSimulatedResponse] = useState<{
    id: string;
    client_name: string;
    price: number;
    created_at: string;
  } | null>(null);

  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useUIStore();

  // Close modal when pressing Escape
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
      const numPrice = parseFloat(price) || 0;
      if (!clientName.trim()) {
        throw new Error('Client name is required');
      }
      return createProposal({
        client_name: clientName.trim(),
        price: numPrice,
        status: 'draft',
        scope_of_work: scopeOfWork.trim(),
      });
    },
    onSuccess: (newProp) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setSimulatedResponse({
        id: newProp.id,
        client_name: newProp.client_name,
        price: newProp.price,
        created_at: newProp.created_at,
      });
      notifySuccess(
        'MCP Proposal Created!',
        `"create_proposal" successfully generated proposal for ${newProp.client_name}.`
      );
    },
    onError: (err: Error) => {
      notifyError('MCP Execution Failed', err.message);
    },
  });

  if (!isOpen) return null;

  const mcpServerAbsolutePath = '/Users/shafi/prop/mcp-server/dist/index.js';
  const rootEnvPath = '/Users/shafi/prop/.env';

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

  const claudeCodeCliCmd = `claude mcp add proposeit -- node ${mcpServerAbsolutePath}`;
  const cursorCommand = `node ${mcpServerAbsolutePath}`;
  const terminalTestCmd = `cd /Users/shafi/prop/mcp-server && npm run test:create`;
  const claudeConfigOpenCmd = `open ~/Library/Application\\ Support/Claude/claude_desktop_config.json`;

  const windsurfConfig = JSON.stringify(
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-popover border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-primary border border-emerald-200/80 shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-charcoal">MCP Integration Hub</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Stdio Server Ready
                </span>
              </div>
              <p className="text-xs text-charcoal-muted mt-0.5">
                Connect external AI agents (Claude, Cursor, CLI) or simulate tool calls in real time.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-charcoal hover:bg-slate-100 transition-colors"
            title="Close modal (Esc)"
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
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'tools'
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Tool Reference</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-5">
              {/* Common Env Notice */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-charcoal space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-700" />
                    Unified Single Root Environment
                  </span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-semibold select-all">
                    {rootEnvPath}
                  </span>
                </div>
                <p className="text-emerald-800 leading-relaxed text-[12px]">
                  Both this web app and the MCP server read directly from the root <code className="bg-white/80 text-emerald-950 font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-200">.env</code> file. No duplicate keys or dual configurations needed!
                </p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Current Mode:{' '}
                    <strong>{isConfigured ? 'Live Supabase DB' : 'Zero-Config Local Demo (No DB Credentials Required)'}</strong>
                  </span>
                </div>
              </div>

              {/* Sub-tabs for AI clients */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-muted mb-2">
                  Select Your AI Client / IDE:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 p-1.5 rounded-xl">
                  {(
                    [
                      { id: 'claude-desktop', label: 'Claude Desktop' },
                      { id: 'cursor', label: 'Cursor IDE' },
                      { id: 'claude-code', label: 'Claude Code CLI' },
                      { id: 'windsurf', label: 'Windsurf / VS Code' },
                      { id: 'terminal', label: 'Terminal Test' },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setGuidePlatform(item.id)}
                      className={`py-2 px-2 rounded-lg text-xs font-semibold text-center transition-all ${
                        guidePlatform === item.id
                          ? 'bg-white text-primary shadow-sm font-bold'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CLAUDE DESKTOP GUIDE */}
              {guidePlatform === 'claude-desktop' && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-charcoal flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-primary" />
                      Step 1: Open Claude Desktop Configuration
                    </h4>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      On macOS, open or create your Claude Desktop config JSON at:
                    </p>
                    <div className="relative mt-1">
                      <code className="text-[11px] font-mono bg-white text-charcoal p-2 rounded-lg border border-slate-200 block select-all">
                        ~/Library/Application Support/Claude/claude_desktop_config.json
                      </code>
                      <button
                        onClick={() => copyToClipboard(claudeConfigOpenCmd, 'open-claude')}
                        className="absolute top-1.5 right-1.5 bg-slate-100 hover:bg-slate-200 text-charcoal text-[10px] font-medium rounded px-2 py-1 flex items-center gap-1 transition-colors border border-slate-200"
                        title="Copy terminal command to open file"
                      >
                        {copiedKey === 'open-claude' ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                        <span>Copy Open Command</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-charcoal flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      Step 2: Add ProposeIt MCP Server
                    </h4>
                    <p className="text-xs text-charcoal-muted">
                      Paste the following block into your <code className="font-mono text-charcoal font-semibold">"mcpServers"</code> configuration:
                    </p>
                    <div className="relative mt-1">
                      <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                        {claudeDesktopConfig}
                      </pre>
                      <button
                        onClick={() => copyToClipboard(claudeDesktopConfig, 'claude-desktop')}
                        className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                      >
                        {copiedKey === 'claude-desktop' ? (
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
                  </div>

                  <div className="text-xs text-charcoal-muted pt-1 leading-relaxed border-t border-slate-200">
                    <strong>Step 3:</strong> Restart Claude Desktop. The hammer icon 🔨 will appear in Claude with <code className="font-mono text-primary font-bold">create_proposal</code>, <code className="font-mono text-primary font-bold">list_proposals</code>, and <code className="font-mono text-primary font-bold">get_proposal</code> available!
                  </div>
                </div>
              )}

              {/* CURSOR GUIDE */}
              {guidePlatform === 'cursor' && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="space-y-1 text-xs text-charcoal-muted leading-relaxed">
                    <h4 className="font-bold text-charcoal">Step 1: Open Cursor Settings</h4>
                    <p>Press <kbd className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px] text-charcoal">Cmd + ,</kbd> → navigate to <strong>Features</strong> → <strong>MCP</strong>.</p>
                  </div>

                  <div className="space-y-1 text-xs text-charcoal-muted leading-relaxed">
                    <h4 className="font-bold text-charcoal">Step 2: Add New MCP Server</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Name: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-charcoal font-semibold">proposeit</code></li>
                      <li>Type: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-charcoal font-semibold">command</code></li>
                      <li>Command:</li>
                    </ul>
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {cursorCommand}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(cursorCommand, 'cursor')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
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

              {/* CLAUDE CODE CLI GUIDE */}
              {guidePlatform === 'claude-code' && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-charcoal flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-primary" />
                      Add to Claude Code CLI in 1 Step
                    </h4>
                    <p className="text-xs text-charcoal-muted leading-relaxed">
                      Run this single command in your terminal to instantly register the ProposeIt MCP server in Claude Code:
                    </p>
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {claudeCodeCliCmd}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(claudeCodeCliCmd, 'claude-code')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                    >
                      {copiedKey === 'claude-code' ? (
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

              {/* WINDSURF / VS CODE GUIDE */}
              {guidePlatform === 'windsurf' && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="space-y-1 text-xs text-charcoal-muted leading-relaxed">
                    <h4 className="font-bold text-charcoal">Windsurf / Roo Code / Cline MCP Config</h4>
                    <p>Add this entry to your client's <code className="font-mono bg-white border border-slate-200 px-1 rounded text-charcoal">mcp_config.json</code>:</p>
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {windsurfConfig}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(windsurfConfig, 'windsurf')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                    >
                      {copiedKey === 'windsurf' ? (
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
                </div>
              )}

              {/* TERMINAL TEST RUNNER */}
              {guidePlatform === 'terminal' && (
                <div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50/50">
                  <div className="space-y-1 text-xs text-charcoal-muted leading-relaxed">
                    <h4 className="font-bold text-charcoal">Direct Terminal Test Runner</h4>
                    <p>Run the built-in MCP verification script to test tool execution and proposal generation directly:</p>
                  </div>

                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {terminalTestCmd}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(terminalTestCmd, 'terminal')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
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
          )}

          {/* TAB 2: IN-APP TOOL SIMULATOR */}
          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-center justify-between">
                <div>
                  <strong>Live In-App Simulation:</strong> Emulate what happens when an external AI assistant invokes the <code className="font-mono font-bold">create_proposal</code> MCP tool right here in your browser.
                </div>
              </div>

              {simulatedResponse && (
                <div className="p-4 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                      <span className="font-bold">MCP Tool Execution Succeeded!</span>
                    </div>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                      ID: {simulatedResponse.id}
                    </span>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Created proposal for <strong>{simulatedResponse.client_name}</strong> priced at{' '}
                    <strong>₹{simulatedResponse.price.toLocaleString('en-IN')}</strong>. It is now live in your pipeline!
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`/edit/${simulatedResponse.id}`}
                      className="font-bold text-primary inline-flex items-center gap-1 hover:underline text-xs"
                    >
                      Open in Editor <ArrowRight className="h-3.5 w-3.5" />
                    </a>
                    <span className="text-slate-300">|</span>
                    <a
                      href={`/p/${simulatedResponse.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary inline-flex items-center gap-1 hover:underline text-xs"
                    >
                      Public Client View <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
                  Client Name (parameter: clientName)
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Swiggy Delivery Platform"
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
                  rows={3}
                  value={scopeOfWork}
                  onChange={(e) => setScopeOfWork(e.target.value)}
                  placeholder="Deliverables and milestones..."
                />
              </div>

              {/* JSON-RPC Preview */}
              <div className="p-3.5 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                  <Code2 className="h-3 w-3" /> JSON-RPC 2.0 Payload Preview
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

          {/* TAB 3: TOOLS & SCHEMA REFERENCE */}
          {activeTab === 'tools' && (
            <div className="space-y-4">
              <div className="text-xs text-charcoal-muted leading-relaxed">
                The ProposeIt MCP server registers 3 tools compliant with the Model Context Protocol specification:
              </div>

              {/* Tool 1 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    create_proposal
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Primary Tool
                  </span>
                </div>
                <p className="text-xs text-charcoal leading-relaxed">
                  Creates a new client proposal in the ProposeIt pipeline with full pricing and scope breakdown.
                </p>
                <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                  parameters: &#123; clientName: string, scopeOfWork: string, price: number (in INR) &#125;
                </div>
              </div>

              {/* Tool 2 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    list_proposals
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Query Tool
                  </span>
                </div>
                <p className="text-xs text-charcoal leading-relaxed">
                  Lists existing proposals in the system, optionally filtered by status ('all', 'draft', 'sent', 'approved').
                </p>
                <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                  parameters: &#123; status?: string, limit?: number &#125;
                </div>
              </div>

              {/* Tool 3 */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-primary bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    get_proposal
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                    Query Tool
                  </span>
                </div>
                <p className="text-xs text-charcoal leading-relaxed">
                  Retrieves full proposal details by its unique identifier (ID).
                </p>
                <div className="text-[11px] font-mono bg-white p-2.5 rounded border border-slate-200 text-slate-700">
                  parameters: &#123; id: string &#125;
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs text-charcoal-muted">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="font-medium text-charcoal">
              Storage Mode: {isConfigured ? 'Supabase Live' : 'Zero-Config Local Pipeline (Active)'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
