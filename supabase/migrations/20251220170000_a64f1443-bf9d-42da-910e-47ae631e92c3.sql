-- Enable realtime for proposals table
ALTER PUBLICATION supabase_realtime ADD TABLE public.proposals;

-- Enable realtime for invoices table (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;