-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- Enums
DO $$
BEGIN
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_status') THEN
CREATE TYPE customer_status AS ENUM ('Active','On Hold','Closed');
END IF;
IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
CREATE TYPE payment_status AS ENUM ('Paid','Pending','Overdue');
END IF;
END$$;


-- Tables
CREATE TABLE IF NOT EXISTS customers (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
account_number TEXT NOT NULL UNIQUE,
company_name TEXT NOT NULL,
emirate TEXT NOT NULL,
area TEXT NOT NULL,
status customer_status NOT NULL DEFAULT 'Active',
payment_status payment_status NOT NULL DEFAULT 'Pending',
outstanding_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
recovered_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
sales_consultant TEXT NOT NULL,
date_added TIMESTAMPTZ NOT NULL DEFAULT now(),
date_recovered TIMESTAMPTZ
);


CREATE INDEX IF NOT EXISTS idx_customers_company ON customers (company_name);
CREATE INDEX IF NOT EXISTS idx_customers_emirate ON customers (emirate);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers (status);
CREATE INDEX IF NOT EXISTS idx_customers_payment_status ON customers (payment_status);


CREATE TABLE IF NOT EXISTS notes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
html TEXT NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notes_customer ON notes (customer_id, created_at DESC);


CREATE TABLE IF NOT EXISTS visits (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
visit_date DATE NOT NULL,
note_text TEXT,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_visits_date ON visits (visit_date);
CREATE INDEX IF NOT EXISTS idx_visits_customer ON visits (customer_id, visit_date);


-- Optional demo data
INSERT INTO customers (account_number, company_name, emirate, area, status, payment_status, outstanding_amount, recovered_amount, sales_consultant, date_added)
VALUES
('DXB-001','Emaar Properties','Dubai','Downtown Dubai','Active','Pending',250000,0,'Ahmed Al-Mansoori','2024-01-15'),
('AUH-001','Aldar Developments','Abu Dhabi','Yas Island','Active','Overdue',120000,0,'Fatima Al-Hashemi','2024-02-20')
ON CONFLICT (account_number) DO NOTHING;