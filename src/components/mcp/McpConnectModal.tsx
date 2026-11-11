import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Bot,
  IndianRupee,
  Cpu,
  Layers,
  Code2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type OS = 'mac' | 'windows';
type Client = 'claude' | 'cursor' | 'cli';

export function McpConnectModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'setup' | 'prompts' | 'simulate'>('setup');
  const [selectedOS, setSelectedOS] = useState<OS>('mac');
  const [selectedClient, setSelectedClient] = useState<Client>('claude');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Custom prompt builder state
  const [promptClient, setPromptClient] = useState('PhonePe Media');
  const [promptBudget, setPromptBudget] = useState('250000');
  const [promptScope, setPromptScope] = useState('Payment analytics dashboard and checkout redesign');

  // Simulator form state
  const [simClientName, setSimClientName] = useState('Swiggy Delivery Platform');
  const [simPrice, setSimPrice] = useState('180000');
  const [simScope, setSimScope] = useState(
    'Architecture and implementation of live real-time order tracking dashboard with mobile UX revamp.'
  );
  const [simResult, setSimResult] = useState<{ id: string; client_name: string; price: number } | null>(null);

  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useUIStore();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const simulateMutation = useMutation({
    mutationFn: async () => {
      if (!simClientName.trim()) throw new Error('Client name is required');
      return createProposal({
        client_name: simClientName.trim(),
        price: parseFloat(simPrice) || 0,
        status: 'draft',
        scope_of_work: simScope.trim(),
      });
    },
    onSuccess: (newProp) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setSimResult({
        id: newProp.id,
        client_name: newProp.client_name,
        price: newProp.price,
      });
      notifySuccess('Proposal Created via MCP Simulator!', `Saved proposal for ${newProp.client_name}.`);
    },
    onError: (err: Error) => {
      notifyError('MCP Execution Failed', err.message);
    },
  });

  if (!isOpen) return null;

  // Paths for Mac & Windows
  const macServerPath = '/Users/shafi/prop/mcp-server/dist/index.js';
  const winServerPath = 'C:\\\\Users\\\\YourUsername\\\\prop\\\\mcp-server\\\\dist\\\\index.js';
  const serverPath = selectedOS === 'mac' ? macServerPath : winServerPath;

  const macConfigPath = '~/Library/Application Support/Claude/claude_desktop_config.json';
  const winConfigPath = '%APPDATA%\\Claude\\claude_desktop_config.json';
  const configPath = selectedOS === 'mac' ? macConfigPath : winConfigPath;

  const macOpenCmd = `open ~/Library/Application\\ Support/Claude/claude_desktop_config.json`;
  const winOpenCmd = `notepad %APPDATA%\\Claude\\claude_desktop_config.json`;
  const openCmd = selectedOS === 'mac' ? macOpenCmd : winOpenCmd;

  const claudeDesktopConfig = JSON.stringify(
    {
      mcpServers: {
        proposeit: {
          command: 'node',
          args: [serverPath],
        },
      },
    },
    null,
    2
  );

  const cursorCommand = `node ${serverPath}`;
  const claudeCodeCmd = `claude mcp add proposeit -- node ${serverPath}`;

  // Ready-to-use copyable prompt
  const generatedAiPrompt = `Create a professional project proposal for client "${promptClient}" with an investment of ₹${(
    parseFloat(promptBudget) || 0
  ).toLocaleString('en-IN')} covering: ${promptScope}. Use the create_proposal tool to save it into ProposeIt.`;

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

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl my-auto rounded-2xl bg-white shadow-popover border border-slate-200 overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-primary border border-emerald-200 shadow-sm">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-charcoal">Connect with MCP</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  Ready
                </span>
              </div>
              <p className="text-xs text-charcoal-muted">
                Connect external AI agents (Claude, Cursor) or get ready-to-use prompts.
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

        {/* Top Primary Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>1. Connect Agent</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'prompts'
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>2. Prompts for AI</span>
          </button>

          <button
            onClick={() => setActiveTab('simulate')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'simulate'
                ? 'border-primary text-primary'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>3. Test Simulator</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: SETUP (MAC + WINDOWS) */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              {/* OS & Client Selectors */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {/* Operating System Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal">Operating System:</span>
                  <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => setSelectedOS('mac')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        selectedOS === 'mac'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      macOS
                    </button>
                    <button
                      onClick={() => setSelectedOS('windows')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        selectedOS === 'windows'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      Windows
                    </button>
                  </div>
                </div>

                {/* AI Client Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-charcoal">App:</span>
                  <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                    <button
                      onClick={() => setSelectedClient('claude')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        selectedClient === 'claude'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      Claude Desktop
                    </button>
                    <button
                      onClick={() => setSelectedClient('cursor')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        selectedClient === 'cursor'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      Cursor
                    </button>
                    <button
                      onClick={() => setSelectedClient('cli')}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        selectedClient === 'cli'
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-charcoal-muted hover:text-charcoal'
                      }`}
                    >
                      CLI
                    </button>
                  </div>
                </div>
              </div>

              {/* CLAUDE DESKTOP CONFIG */}
              {selectedClient === 'claude' && (
                <div className="space-y-4">
                  {/* Step 1 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-charcoal">
                        Step 1: Open Claude Configuration File ({selectedOS === 'mac' ? 'macOS' : 'Windows'})
                      </span>
                      <button
                        onClick={() => copyToClipboard(openCmd, 'opencmd')}
                        className="text-[11px] text-primary hover:underline font-semibold flex items-center gap-1"
                      >
                        {copiedKey === 'opencmd' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        Copy Open Command
                      </button>
                    </div>
                    <code className="text-[11px] font-mono bg-slate-100 text-charcoal px-2.5 py-1.5 rounded-lg border border-slate-200 block select-all">
                      {configPath}
                    </code>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-charcoal">
                        Step 2: Add to <span className="font-mono text-emerald-800">"mcpServers"</span>
                      </span>
                      <button
                        onClick={() => copyToClipboard(claudeDesktopConfig, 'claudeserver')}
                        className="text-[11px] bg-primary text-white px-2 py-0.5 rounded font-semibold flex items-center gap-1 hover:bg-primary-hover shadow-xs"
                      >
                        {copiedKey === 'claudeserver' ? (
                          <>
                            <Check className="h-3 w-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy JSON
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
                      {claudeDesktopConfig}
                    </pre>
                  </div>

                  <p className="text-xs text-charcoal-muted">
                    <strong>Step 3:</strong> Restart Claude Desktop. The hammer icon 🔨 will appear with tool{' '}
                    <code className="font-mono text-primary font-bold">create_proposal</code> enabled!
                  </p>
                </div>
              )}

              {/* CURSOR IDE CONFIG */}
              {selectedClient === 'cursor' && (
                <div className="space-y-3">
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    <strong>Step 1:</strong> In Cursor, open Settings (
                    <kbd className="font-mono bg-slate-100 px-1 rounded">{selectedOS === 'mac' ? 'Cmd + ,' : 'Ctrl + ,'}</kbd>
                    ) → go to <strong>Features</strong> → <strong>MCP</strong>.
                  </div>
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    <strong>Step 2:</strong> Click <strong>+ Add New MCP Server</strong>:
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>Name: <code className="font-mono bg-slate-100 px-1 rounded">proposeit</code></li>
                      <li>Type: <code className="font-mono bg-slate-100 px-1 rounded">command</code></li>
                      <li>Command:</li>
                    </ul>
                  </div>
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {cursorCommand}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(cursorCommand, 'cursorcmd')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1 border border-slate-700 shadow-sm"
                    >
                      {copiedKey === 'cursorcmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Command</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CLI (CLAUDE CODE) */}
              {selectedClient === 'cli' && (
                <div className="space-y-3">
                  <div className="text-xs text-charcoal-muted leading-relaxed">
                    Register the MCP server in Claude Code CLI with a single command:
                  </div>
                  <div className="relative">
                    <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-[11px] overflow-x-auto select-all">
                      {claudeCodeCmd}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(claudeCodeCmd, 'clicmd')}
                      className="absolute top-2.5 right-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1 border border-slate-700 shadow-sm"
                    >
                      {copiedKey === 'clicmd' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>Copy Command</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROMPTS SECTION */}
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-700 flex-shrink-0" />
                <span>
                  Once your MCP server is connected, copy and paste these prompts into Claude or Cursor to automatically create proposals!
                </span>
              </div>

              {/* Dynamic Prompt Builder */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider">
                  Interactive Proposal Prompt Generator
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">
                      Client Name
                    </label>
                    <Input
                      value={promptClient}
                      onChange={(e) => setPromptClient(e.target.value)}
                      placeholder="e.g. PhonePe"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal-muted mb-1 flex items-center gap-1">
                      <IndianRupee className="h-3 w-3 text-slate-400" />
                      Budget in INR (₹)
                    </label>
                    <Input
                      type="number"
                      value={promptBudget}
                      onChange={(e) => setPromptBudget(e.target.value)}
                      placeholder="250000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-muted mb-1">
                    Project Scope / Deliverables
                  </label>
                  <Input
                    value={promptScope}
                    onChange={(e) => setPromptScope(e.target.value)}
                    placeholder="e.g. Payment analytics dashboard and checkout redesign"
                  />
                </div>

                {/* Output Prompt */}
                <div className="relative mt-2">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs text-charcoal leading-relaxed font-medium">
                    "{generatedAiPrompt}"
                  </div>
                  <button
                    onClick={() => copyToClipboard(generatedAiPrompt, 'genprompt')}
                    className="mt-2 w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    {copiedKey === 'genprompt' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy Prompt for Claude / Cursor</span>
                  </button>
                </div>
              </div>

              {/* Ready-to-use Preset Prompts */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-charcoal uppercase tracking-wider block">
                  Quick Preset Prompts
                </span>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-charcoal">Quick Website Redesign Proposal</p>
                    <p className="text-[11px] text-charcoal-muted">Creates a ₹1,50,000 Next.js landing page proposal</p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'Create a proposal for "Acme Global" with price 150000 INR for responsive landing page redesign in Tailwind CSS with micro-interactions, using the create_proposal tool.',
                        'preset1'
                      )
                    }
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    {copiedKey === 'preset1' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Prompt
                  </button>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-charcoal">List Existing Proposals</p>
                    <p className="text-[11px] text-charcoal-muted">Ask your AI to view existing proposals in the system</p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        'List my recent proposals in ProposeIt using the list_proposals tool.',
                        'preset2'
                      )
                    }
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0"
                  >
                    {copiedKey === 'preset2' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEST SIMULATOR */}
          {activeTab === 'simulate' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-charcoal-muted leading-relaxed">
                Test creating a proposal right now without opening an external AI client.
              </div>

              {simResult && (
                <div className="p-3.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-xs text-emerald-900 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      Proposal Created Successfully!
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold">
                      ID: {simResult.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Client: <strong>{simResult.client_name}</strong> | Price: <strong>₹{simResult.price.toLocaleString('en-IN')}</strong>
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <a
                      href={`/edit/${simResult.id}`}
                      className="font-bold text-primary inline-flex items-center gap-1 hover:underline text-xs"
                    >
                      Open in Editor <ArrowRight className="h-3 w-3" />
                    </a>
                    <span className="text-slate-300">|</span>
                    <a
                      href={`/p/${simResult.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-primary inline-flex items-center gap-1 hover:underline text-xs"
                    >
                      Public Client View <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
                  Client Name
                </label>
                <Input
                  value={simClientName}
                  onChange={(e) => setSimClientName(e.target.value)}
                  placeholder="e.g. Swiggy Delivery Platform"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1 flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                  Proposed Price (₹ INR)
                </label>
                <Input
                  type="number"
                  value={simPrice}
                  onChange={(e) => setSimPrice(e.target.value)}
                  placeholder="180000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1">
                  Scope of Work
                </label>
                <Textarea
                  rows={3}
                  value={simScope}
                  onChange={(e) => setSimScope(e.target.value)}
                  placeholder="Deliverables and milestones..."
                />
              </div>

              {/* JSON-RPC Preview */}
              <div className="p-3 bg-slate-900 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto">
                <div className="text-slate-400 text-[10px] uppercase font-bold mb-1 flex items-center gap-1">
                  <Code2 className="h-3 w-3" /> JSON-RPC Preview
                </div>
                {JSON.stringify(
                  {
                    jsonrpc: '2.0',
                    method: 'tools/call',
                    params: {
                      name: 'create_proposal',
                      arguments: {
                        clientName: simClientName.trim() || '...',
                        price: parseFloat(simPrice) || 0,
                        scopeOfWork: simScope.trim() || '...',
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
                  <span>{simulateMutation.isPending ? 'Executing...' : 'Execute Tool Call'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between text-xs text-charcoal-muted">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isConfigured ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'
              }`}
            />
            <span className="font-medium text-charcoal">
              Storage: {isConfigured ? 'Supabase Live' : 'Zero-Config Local Mode'}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs h-7">
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
