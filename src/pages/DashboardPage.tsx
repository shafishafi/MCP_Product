import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { getProposals, deleteProposal, resetDemoData, isConfigured } from '../lib/supabase';
import { formatCurrency, formatDate } from '../lib/utils';
import { useUIStore } from '../store/uiStore';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/ui/table';
import { Card, CardContent } from '../components/ui/card';
import { CreateProposalModal } from '../components/proposals/CreateProposalModal';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { Proposal } from '../types/proposal';
import {
  Search,
  Plus,
  ExternalLink,
  Edit3,
  TrendingUp,
  FileCheck,
  Send,
  FileEdit,
  IndianRupee,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Copy,
  Trash2,
  RotateCcw,
} from 'lucide-react';

export function DashboardPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);
  const queryClient = useQueryClient();
  const { filterStatus, setFilterStatus, searchQuery, setSearchQuery, notifySuccess, notifyError } = useUIStore();

  const {
    data: proposals = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['proposals'],
    queryFn: getProposals,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      notifySuccess('Proposal Deleted', 'Proposal has been removed.');
    },
    onError: (err: Error) => {
      notifyError('Failed to delete proposal', err.message);
    },
  });

  const handleCopyLink = (id: string, clientName: string) => {
    const publicUrl = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(publicUrl);
    notifySuccess('Link Copied', `Public proposal link for "${clientName}" copied to clipboard.`);
  };

  const handleResetDemo = () => {
    resetDemoData();
    queryClient.invalidateQueries({ queryKey: ['proposals'] });
    notifySuccess('Demo Data Reset', 'Initial sample proposals restored.');
  };

  // Calculate metrics
  const totalPipeline = proposals.reduce((acc, p) => acc + (p.price || 0), 0);
  const approvedTotal = proposals
    .filter((p) => p.status === 'approved')
    .reduce((acc, p) => acc + (p.price || 0), 0);
  const activeCount = proposals.filter((p) => p.status === 'sent').length;
  const draftCount = proposals.filter((p) => p.status === 'draft').length;

  // Filtered proposals
  const filteredProposals = proposals.filter((p) => {
    const matchesFilter =
      filterStatus === 'all' ? true : p.status === filterStatus;
    const matchesSearch =
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.scope_of_work.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-charcoal">
            Proposals Overview
          </h1>
          <p className="text-sm text-charcoal-muted mt-1">
            Manage your project pipelines, client contracts, and fee structures.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isConfigured && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              className="text-xs text-charcoal-muted hover:text-charcoal hidden sm:inline-flex"
              title="Reset initial seed proposals"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1 text-slate-400" />
              <span>Reset Demo</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            onClick={() => setIsCreateOpen(true)}
            size="default"
            className="gap-2 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Proposal</span>
          </Button>
        </div>
      </div>

      {/* KPI Stat Cards (DESIGN.md emerald styling) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Value */}
        <Card className="relative overflow-hidden border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Pipeline Value
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-primary">
                <IndianRupee className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-charcoal">
                {formatCurrency(totalPipeline)}
              </span>
              <p className="text-xs text-charcoal-muted mt-1">
                Across {proposals.length} total proposals
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Approved Value */}
        <Card className="relative overflow-hidden border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Approved Revenue
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-emerald-800">
                {formatCurrency(approvedTotal)}
              </span>
              <p className="text-xs text-emerald-700 mt-1 font-medium flex items-center gap-1">
                <FileCheck className="h-3 w-3" />
                {proposals.filter((p) => p.status === 'approved').length} closed deals
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sent & Awaiting Client */}
        <Card className="relative overflow-hidden border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Pending Review
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <Send className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-charcoal">
                {activeCount}
              </span>
              <p className="text-xs text-amber-700 mt-1 font-medium">
                Sent to clients
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Drafts */}
        <Card className="relative overflow-hidden border-slate-200/80 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                Drafts
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <FileEdit className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-charcoal">
                {draftCount}
              </span>
              <p className="text-xs text-charcoal-muted mt-1">
                In progress
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-slate-200/90 shadow-card">
        {/* Table Filters & Search Bar */}
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {(['all', 'approved', 'sent', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                  filterStatus === status
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-charcoal-muted hover:text-charcoal'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search client or scope..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Proposals Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-charcoal-muted">
              <RefreshCw className="h-6 w-6 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium">Fetching proposals from Supabase...</p>
            </div>
          ) : isError ? (
            <div className="py-16 px-4 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-charcoal">Failed to load proposals</p>
              <p className="text-xs text-charcoal-muted mt-1 mb-4">
                {(error as Error)?.message || 'An unexpected error occurred.'}
              </p>
              <Button size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="py-16 px-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-primary mb-3">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-charcoal">No proposals found</h3>
              <p className="text-xs text-charcoal-muted mt-1 max-w-sm mx-auto">
                {searchQuery || filterStatus !== 'all'
                  ? 'No proposals matched your filter criteria. Try clearing filters or search terms.'
                  : 'Start by creating your first client proposal or generate one via the MCP server.'}
              </p>
              <div className="mt-4">
                {searchQuery || filterStatus !== 'all' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create First Proposal
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Client Name</TableHead>
                  <TableHead className="w-[20%]">Price</TableHead>
                  <TableHead className="w-[18%]">Status</TableHead>
                  <TableHead className="w-[17%]">Date Created</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id} className="group">
                    {/* Client Name */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-charcoal group-hover:text-primary transition-colors">
                          {proposal.client_name}
                        </span>
                        <span className="text-xs text-charcoal-muted line-clamp-1 max-w-sm">
                          {proposal.scope_of_work}
                        </span>
                      </div>
                    </TableCell>

                    {/* Price */}
                    <TableCell>
                      <span className="font-bold text-charcoal text-base">
                        {formatCurrency(proposal.price)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge status={proposal.status} />
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <span className="text-xs text-charcoal-muted font-medium">
                        {formatDate(proposal.created_at)}
                      </span>
                    </TableCell>

                    {/* Actions: Copy Link, View, Edit & Delete */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                        {/* Copy Share Link */}
                        <button
                          onClick={() => handleCopyLink(proposal.id, proposal.client_name)}
                          title="Copy Public Proposal Link"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-emerald-50 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        {/* Public Client View Link */}
                        <Link
                          to="/p/$proposalId"
                          params={{ proposalId: proposal.id }}
                          target="_blank"
                          rel="noreferrer"
                          title="Open Client Public Landing Page"
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-emerald-50 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        {/* Edit Button */}
                        <Link
                          to="/edit/$proposalId"
                          params={{ proposalId: proposal.id }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs font-semibold px-2.5"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
                            <span>Edit</span>
                          </Button>
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => setProposalToDelete(proposal)}
                          title="Delete Proposal"
                          disabled={deleteMutation.isPending}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Modal for creating a new proposal */}
      <CreateProposalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Styled Confirmation Dialog for Deletion */}
      <ConfirmDialog
        isOpen={Boolean(proposalToDelete)}
        onClose={() => setProposalToDelete(null)}
        onConfirm={() => {
          if (proposalToDelete) {
            deleteMutation.mutate(proposalToDelete.id, {
              onSettled: () => setProposalToDelete(null),
            });
          }
        }}
        title="Delete Proposal"
        description={
          <span>
            Are you sure you want to delete the proposal for{' '}
            <strong className="text-charcoal font-semibold">
              "{proposalToDelete?.client_name}"
            </strong>
            ? This will remove the proposal from your pipeline permanently.
          </span>
        }
        confirmText="Delete Proposal"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
