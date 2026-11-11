import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { getProposalById, updateProposal, deleteProposal } from '../lib/supabase';
import { ProposalStatus, UpdateProposalInput } from '../types/proposal';
import { formatCurrency, formatDate } from '../lib/utils';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft,
  Save,
  ExternalLink,
  IndianRupee,
  User,
  FileText,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Copy,
  Trash2,
} from 'lucide-react';

export function EditorPage() {
  const { proposalId } = useParams({ strict: false }) as { proposalId: string };
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useUIStore();

  const {
    data: proposal,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['proposal', proposalId],
    queryFn: () => getProposalById(proposalId),
    enabled: Boolean(proposalId),
  });

  // Local form state
  const [clientName, setClientName] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState<ProposalStatus>('draft');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state once proposal data arrives
  useEffect(() => {
    if (proposal) {
      setClientName(proposal.client_name);
      setPrice(proposal.price.toString());
      setStatus(proposal.status);
      setScopeOfWork(proposal.scope_of_work);
    }
  }, [proposal]);

  // TanStack Query Mutation
  const saveMutation = useMutation({
    mutationFn: (updates: UpdateProposalInput) => updateProposal(proposalId, updates),
    onSuccess: (updated) => {
      // Invalidate relevant query keys
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.setQueryData(['proposal', proposalId], updated);

      notifySuccess(
        'Proposal Updated',
        `Changes to proposal for "${updated.client_name}" have been saved.`
      );
    },
    onError: (err: Error) => {
      notifyError('Save Failed', err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProposal(proposalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      notifySuccess('Proposal Deleted', 'Proposal has been removed.');
      navigate({ to: '/' });
    },
    onError: (err: Error) => {
      notifyError('Delete Failed', err.message);
    },
  });

  const handleCopyLink = () => {
    const url = `${window.location.origin}/p/${proposalId}`;
    navigator.clipboard.writeText(url);
    notifySuccess('Link Copied', 'Public proposal link copied to clipboard.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      newErrors.price = 'Please enter a valid price (at least $0)';
    }
    if (!scopeOfWork.trim()) {
      newErrors.scopeOfWork = 'Scope of work cannot be empty';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    saveMutation.mutate({
      client_name: clientName.trim(),
      price: numPrice,
      status,
      scope_of_work: scopeOfWork.trim(),
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-charcoal-muted">
        <RefreshCw className="h-7 w-7 animate-spin text-primary mb-3" />
        <p className="text-sm font-medium">Loading proposal details...</p>
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-charcoal">Unable to find proposal</h2>
        <p className="text-sm text-charcoal-muted mt-1 mb-6">
          {(error as Error)?.message || 'The requested proposal does not exist or was deleted.'}
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" onClick={() => navigate({ to: '/' })}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Dashboard
          </Button>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  const numericPreviewPrice = parseFloat(price) || 0;

  return (
    <div className="space-y-6">
      {/* Top Header bar with navigation and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-charcoal">
                Edit Proposal
              </h1>
              <Badge status={status} />
            </div>
            <p className="text-xs text-charcoal-muted">
              ID: <span className="font-mono">{proposal.id}</span> · Created on {formatDate(proposal.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Copy Share Link */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 text-xs hidden sm:inline-flex"
            title="Copy Public Link"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Link</span>
          </Button>

          {/* Public Preview Button */}
          <Link
            to="/p/$proposalId"
            params={{ proposalId: proposal.id }}
            target="_blank"
            rel="noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Client View</span>
            </Button>
          </Link>

          {/* Delete Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm(`Delete proposal for "${clientName || 'this client'}"?`)) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            title="Delete Proposal"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>

          {/* Primary Save Button */}
          <Button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            size="sm"
            className="gap-1.5 shadow-sm min-w-[120px]"
          >
            {saveMutation.isPending ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveMutation.isSuccess ? (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-emerald-200" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Editor Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-card">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Proposal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {/* Client Name Input */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Client Name
                </label>
                <Input
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.clientName) setErrors({ ...errors, clientName: '' });
                  }}
                  placeholder="e.g. Acme Corporation"
                  error={errors.clientName}
                />
              </div>

              {/* Price and Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                    Price (₹ INR)
                  </label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors({ ...errors, price: '' });
                    }}
                    placeholder="e.g. 75000"
                    error={errors.price}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5">
                    Proposal Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="draft">Draft (Work in progress)</option>
                    <option value="sent">Sent (Awaiting client review)</option>
                    <option value="approved">Approved (Accepted by client)</option>
                  </select>
                </div>
              </div>

              {/* Scope of Work Textarea */}
              <div>
                <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Scope of Work & Deliverables
                </label>
                <Textarea
                  rows={8}
                  value={scopeOfWork}
                  onChange={(e) => {
                    setScopeOfWork(e.target.value);
                    if (errors.scopeOfWork) setErrors({ ...errors, scopeOfWork: '' });
                  }}
                  placeholder="Specify deliverables, milestones, tech requirements, and project terms..."
                  error={errors.scopeOfWork}
                />
                <p className="mt-1.5 text-xs text-charcoal-muted">
                  Be descriptive. This scope is rendered verbatim on the client-facing public page.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Estimate & Meta Summary Sidebar Card */}
        <div className="space-y-6">
          {/* Investment Summary */}
          <Card className="border-slate-200 bg-gradient-to-br from-emerald-950/90 to-primary text-white shadow-hero">
            <CardContent className="p-6">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                Proposed Investment
              </span>
              <div className="mt-2 text-3xl font-extrabold tracking-tight">
                {formatCurrency(numericPreviewPrice)}
              </div>
              <p className="text-xs text-emerald-100/80 mt-1">
                Fixed-price milestone quote
              </p>

              <div className="mt-6 pt-5 border-t border-emerald-800/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-emerald-100">
                  <span>Client</span>
                  <span className="font-semibold text-white truncate max-w-[150px]">
                    {clientName || 'Untitled Client'}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span>Current State</span>
                  <span className="capitalize font-semibold text-white">
                    {status}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-100">
                  <span>Last Updated</span>
                  <span className="font-mono text-[11px] text-emerald-200">
                    Just now
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Client Sharing link */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-charcoal">
                Client Portal Link
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Clients can view the read-only proposal, inspect terms, and digitally approve it via their dedicated link.
              </p>
              <Link
                to="/p/$proposalId"
                params={{ proposalId: proposal.id }}
                target="_blank"
                rel="noreferrer"
                className="w-full"
              >
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  <span>Preview Client View</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
