export type ProposalStatus = 'draft' | 'sent' | 'approved';

export interface Proposal {
  id: string;
  client_name: string;
  scope_of_work: string;
  price: number;
  status: ProposalStatus;
  created_at: string;
}

export type UpdateProposalInput = Partial<Omit<Proposal, 'id' | 'created_at'>>;

export interface Database {
  public: {
    Tables: {
      proposals: {
        Row: Proposal;
        Insert: Omit<Proposal, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: UpdateProposalInput;
      };
    };
  };
}

