import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProposal } from '../../lib/supabase';
import { ProposalStatus } from '../../types/proposal';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { X, DollarSign, User, FileText } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProposalModal({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useUIStore();

  const [clientName, setClientName] = useState('');
  const [price, setPrice] = useState('5000');
  const [status, setStatus] = useState<ProposalStatus>('draft');
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: createProposal,
    onSuccess: (newProp) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      notifySuccess(
        'Proposal Created',
        `Proposal for ${newProp.client_name} was saved successfully.`
      );
      onClose();
      // Reset form
      setClientName('');
      setPrice('5000');
      setStatus('draft');
      setScopeOfWork('');
      setErrors({});
    },
    onError: (err: Error) => {
      notifyError('Failed to create proposal', err.message);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.price = 'Please enter a valid price greater than $0';
    }
    if (!scopeOfWork.trim()) {
      newErrors.scopeOfWork = 'Scope of work is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      client_name: clientName.trim(),
      price: numPrice,
      status,
      scope_of_work: scopeOfWork.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-popover border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-charcoal">Create New Proposal</h2>
              <p className="text-xs text-charcoal-muted">
                Add a new project proposal for your client.
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-slate-500" />
              Client Name
            </label>
            <Input
              placeholder="e.g. Acme Corp or Jane Doe"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                if (errors.clientName) setErrors({ ...errors, clientName: '' });
              }}
              error={errors.clientName}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-slate-500" />
                Proposed Price ($ USD)
              </label>
              <Input
                type="number"
                placeholder="5000"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  if (errors.price) setErrors({ ...errors, price: '' });
                }}
                error={errors.price}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-1.5">
              Scope of Work
            </label>
            <Textarea
              rows={4}
              placeholder="Outline project milestones, deliverables, timelines, and terms..."
              value={scopeOfWork}
              onChange={(e) => {
                setScopeOfWork(e.target.value);
                if (errors.scopeOfWork) setErrors({ ...errors, scopeOfWork: '' });
              }}
              error={errors.scopeOfWork}
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Proposal'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
