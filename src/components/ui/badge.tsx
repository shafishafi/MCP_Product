import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { ProposalStatus } from '../../types/proposal';

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
        approved: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
        sent: 'bg-amber-100 text-amber-800 border border-amber-200/60',
        draft: 'bg-slate-100 text-slate-700 border border-slate-200',
        outline: 'text-charcoal border border-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  status?: ProposalStatus;
  showDot?: boolean;
}

export function Badge({
  className,
  variant,
  status,
  showDot = true,
  children,
  ...props
}: BadgeProps) {
  const resolvedVariant = status ? status : variant || 'default';

  const dotColorClass =
    resolvedVariant === 'approved'
      ? 'bg-emerald-600'
      : resolvedVariant === 'sent'
      ? 'bg-amber-500'
      : resolvedVariant === 'draft'
      ? 'bg-slate-500'
      : 'bg-emerald-600';

  return (
    <div
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full inline-block', dotColorClass)}
        />
      )}
      <span>{children ?? (status ? status.toUpperCase() : null)}</span>
    </div>
  );
}

