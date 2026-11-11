-- ProposeIt Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    scope_of_work TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    signed_by TEXT,
    signer_title TEXT,
    signed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Open policies for development / MVP usage
CREATE POLICY "Allow public read access"
    ON public.proposals FOR SELECT
    USING (true);

CREATE POLICY "Allow public insert access"
    ON public.proposals FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public update access"
    ON public.proposals FOR UPDATE
    USING (true);

CREATE POLICY "Allow public delete access"
    ON public.proposals FOR DELETE
    USING (true);
