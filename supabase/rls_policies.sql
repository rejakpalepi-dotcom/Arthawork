-- =====================================================
-- RLS (Row Level Security) Policies for Arthawork
-- =====================================================
-- Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New Query → Paste & Run
-- =====================================================
-- STEP 1: Enable RLS on all tables
-- =====================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
-- =====================================================
-- STEP 2: Create policies for CLIENTS table
-- =====================================================
-- Users can only SELECT their own clients
DROP POLICY IF EXISTS "Users can view own clients" ON clients;
CREATE POLICY "Users can view own clients" ON clients FOR
SELECT USING (auth.uid() = user_id);
-- Users can only INSERT their own clients
DROP POLICY IF EXISTS "Users can create own clients" ON clients;
CREATE POLICY "Users can create own clients" ON clients FOR
INSERT WITH CHECK (auth.uid() = user_id);
-- Users can only UPDATE their own clients
DROP POLICY IF EXISTS "Users can update own clients" ON clients;
CREATE POLICY "Users can update own clients" ON clients FOR
UPDATE USING (auth.uid() = user_id);
-- Users can only DELETE their own clients
DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
CREATE POLICY "Users can delete own clients" ON clients FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 3: Create policies for SERVICES table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own services" ON services;
CREATE POLICY "Users can view own services" ON services FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own services" ON services;
CREATE POLICY "Users can create own services" ON services FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own services" ON services;
CREATE POLICY "Users can update own services" ON services FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own services" ON services;
CREATE POLICY "Users can delete own services" ON services FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 4: Create policies for INVOICES table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own invoices" ON invoices;
CREATE POLICY "Users can create own invoices" ON invoices FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices" ON invoices FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Users can delete own invoices" ON invoices FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 5: Create policies for INVOICE_ITEMS table
-- =====================================================
-- Invoice items: user can access if they own the parent invoice
DROP POLICY IF EXISTS "Users can view own invoice items" ON invoice_items;
CREATE POLICY "Users can view own invoice items" ON invoice_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
                AND invoices.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can create own invoice items" ON invoice_items;
CREATE POLICY "Users can create own invoice items" ON invoice_items FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
                AND invoices.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can update own invoice items" ON invoice_items;
CREATE POLICY "Users can update own invoice items" ON invoice_items FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
                AND invoices.user_id = auth.uid()
        )
    );
DROP POLICY IF EXISTS "Users can delete own invoice items" ON invoice_items;
CREATE POLICY "Users can delete own invoice items" ON invoice_items FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM invoices
        WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
    )
);
-- =====================================================
-- STEP 6: Create policies for PROPOSALS table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own proposals" ON proposals;
CREATE POLICY "Users can view own proposals" ON proposals FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own proposals" ON proposals;
CREATE POLICY "Users can create own proposals" ON proposals FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own proposals" ON proposals;
CREATE POLICY "Users can update own proposals" ON proposals FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own proposals" ON proposals;
CREATE POLICY "Users can delete own proposals" ON proposals FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 7: Create policies for TODOS table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own todos" ON todos;
CREATE POLICY "Users can view own todos" ON todos FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own todos" ON todos;
CREATE POLICY "Users can create own todos" ON todos FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own todos" ON todos;
CREATE POLICY "Users can update own todos" ON todos FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
CREATE POLICY "Users can delete own todos" ON todos FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 8: Create policies for TAX_SUMMARY table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own tax summary" ON tax_summary;
CREATE POLICY "Users can view own tax summary" ON tax_summary FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own tax summary" ON tax_summary;
CREATE POLICY "Users can create own tax summary" ON tax_summary FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own tax summary" ON tax_summary;
CREATE POLICY "Users can update own tax summary" ON tax_summary FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own tax summary" ON tax_summary;
CREATE POLICY "Users can delete own tax summary" ON tax_summary FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 9: Create policies for BUSINESS_SETTINGS table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own business settings" ON business_settings;
CREATE POLICY "Users can view own business settings" ON business_settings FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own business settings" ON business_settings;
CREATE POLICY "Users can create own business settings" ON business_settings FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own business settings" ON business_settings;
CREATE POLICY "Users can update own business settings" ON business_settings FOR
UPDATE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 10: Create policies for PROJECTS table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects" ON projects FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own projects" ON projects;
CREATE POLICY "Users can create own projects" ON projects FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects" ON projects FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- STEP 11: Create policies for CONTRACTS table
-- =====================================================
DROP POLICY IF EXISTS "Users can view own contracts" ON contracts;
CREATE POLICY "Users can view own contracts" ON contracts FOR
SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own contracts" ON contracts;
CREATE POLICY "Users can create own contracts" ON contracts FOR
INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own contracts" ON contracts;
CREATE POLICY "Users can update own contracts" ON contracts FOR
UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own contracts" ON contracts;
CREATE POLICY "Users can delete own contracts" ON contracts FOR DELETE USING (auth.uid() = user_id);
-- =====================================================
-- DONE! All tables now have RLS policies
-- =====================================================
-- How it works:
-- auth.uid() = returns the current logged-in user's ID from JWT
-- user_id = column in each table that stores who owns the row
-- 
-- Result: Users can ONLY access their own data!
-- =====================================================