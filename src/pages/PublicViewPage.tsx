import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from '@tanstack/react-router';
import { getProposalById, updateProposal } from '../lib/supabase';
import { formatCurrency, formatDate } from '../lib/utils';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  FileText,
  CheckCircle2,
  Calendar,
  Building2,
  ShieldCheck,
  Printer,
  ArrowLeft,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export function PublicViewPage() {
  const { proposalId } = useParams({ strict: false }) as { proposalId: string };
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

  const approveMutation = useMutation({
    mutationFn: () => updateProposal(proposalId, { status: 'approved' }),
    onSuccess: (updated) => {
      queryClient.setQueryData(['proposal', proposalId], updated);
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      notifySuccess('Proposal Approved', 'Thank you! The proposal has been formally approved.');
    },
    onError: (err: Error) => {
      notifyError('Approval Failed', err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-charcoal-muted">
        <RefreshCw className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm font-semibold text-charcoal">Loading Client Proposal Document...</p>
      </div>
    );
  }

  if (isError || !proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-card">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-charcoal">Proposal Not Found</h2>
          <p className="text-xs text-charcoal-muted mt-1 mb-6">
            {(error as Error)?.message || 'The link may be invalid or the proposal was removed.'}
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Return to Dashboard
              </Button>
            </Link>
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = proposal.status === 'approved';

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Client Header Bar */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-charcoal tracking-tight">
                Propose<span className="text-primary">It</span>
              </span>
              <span className="hidden sm:inline-block text-xs text-charcoal-muted ml-2 pl-2 border-l border-slate-200">
                Official Client Document
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5 text-xs h-8 px-2.5 print:hidden"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print Document</span>
            </Button>
            <Link to="/" className="print:hidden">
              <Button variant="ghost" size="sm" className="text-xs h-8 px-2.5">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Proposal Document Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-card overflow-hidden">
          {/* Top Decorative Emerald Stripe */}
          <div className="h-2.5 w-full bg-gradient-to-r from-primary via-emerald-600 to-emerald-400" />

          {/* Document Header */}
          <div className="p-6 sm:p-10 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge status={proposal.status} />
                  <span className="text-xs text-charcoal-muted font-mono">
                    REF: {proposal.id.toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
                  Project Proposal & Service Agreement
                </h1>
                <p className="text-sm text-charcoal-muted mt-1.5">
                  Prepared exclusively for <strong className="text-charcoal font-semibold">{proposal.client_name}</strong>
                </p>
              </div>

              {/* Status & Date Stamp */}
              <div className="sm:text-right flex flex-col sm:items-end gap-1">
                <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-medium">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Issued: {formatDate(proposal.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-charcoal-muted font-medium">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Validity: 30 Days from issue</span>
                </div>
              </div>
            </div>

            {/* Client & Contractor Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-1.5 mb-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  Client Account
                </span>
                <p className="text-base font-bold text-charcoal">{proposal.client_name}</p>
                <p className="text-xs text-charcoal-muted mt-0.5">Designated Project Sponsor</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-muted flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  Service Provider
                </span>
                <p className="text-base font-bold text-charcoal">Independent Specialist</p>
                <p className="text-xs text-charcoal-muted mt-0.5">Verified Freelance Professional</p>
              </div>
            </div>
          </div>

          {/* Document Body: Scope of Work */}
          <div className="p-6 sm:p-10 space-y-8">
            <section>
              <h2 className="text-base font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                1. Scope of Work & Deliverables
              </h2>
              <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-6">
                <div className="prose prose-sm max-w-none text-charcoal leading-relaxed whitespace-pre-line text-sm sm:text-base">
                  {proposal.scope_of_work}
                </div>
              </div>
            </section>

            {/* Pricing / Investment Card (DESIGN.md emerald aesthetic) */}
            <section>
              <h2 className="text-base font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary" />
                2. Project Investment & Terms
              </h2>

              <div className="rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Total Fixed Fee Investment
                    </span>
                    <div className="mt-1 text-3xl sm:text-4xl font-extrabold text-charcoal tracking-tight">
                      {formatCurrency(proposal.price)}
                    </div>
                    <p className="text-xs text-charcoal-muted mt-1.5 max-w-md">
                      Inclusive of all outlined design, architecture, implementation milestones, and revisions described in Section 1.
                    </p>
                  </div>

                  {/* Acceptance State or Button */}
                  <div className="sm:text-right print:hidden">
                    {isApproved ? (
                      <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 border border-emerald-300 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <span>Proposal Approved</span>
                      </div>
                    ) : (
                      <Button
                        size="lg"
                        onClick={() => approveMutation.mutate()}
                        disabled={approveMutation.isPending}
                        className="w-full sm:w-auto gap-2 text-sm font-bold shadow-md bg-primary hover:bg-primary-hover px-6"
                      >
                        {approveMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Processing Approval...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Approve & Accept Proposal</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {isApproved && (
                  <div className="mt-6 pt-5 border-t border-emerald-200/70 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>
                      Digitally signed and accepted by {proposal.client_name}. Retain this reference for your records.
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* Terms of Service / Guarantee */}
            <section className="pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-muted mb-2">
                3. General Provisions
              </h2>
              <p className="text-xs text-charcoal-muted leading-relaxed">
                Work will commence upon digital approval of this agreement. All intellectual property, source code, design assets, and deliverables transfer to {proposal.client_name} upon settlement of agreed project milestones.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
