-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_graphql";

-- Create tables
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    organization_id INTEGER REFERENCES organizations(id),
    is_owner BOOLEAN DEFAULT false,
    assigned_vehicle_id INTEGER,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    photos TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD CONSTRAINT fk_assigned_vehicle FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id);

CREATE TABLE drivers (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    phone TEXT NOT NULL,
    documents JSONB,
    custom_fields JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES drivers(id),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount INTEGER,
    date TIMESTAMP NOT NULL,
    recurring BOOLEAN DEFAULT false,
    recurring_frequency TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE revenues (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    activity_id INTEGER REFERENCES activities(id),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'pending',
    proof_of_payment_url TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    organization_id INTEGER REFERENCES organizations(id),
    activity_id INTEGER REFERENCES activities(id),
    amount INTEGER NOT NULL,
    description TEXT NOT NULL,
    date TIMESTAMP NOT NULL,
    status TEXT DEFAULT 'pending',
    attachment_file TEXT,
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies
CREATE POLICY "Enable all operations for authenticated users" ON organizations
    FOR ALL USING (auth.role() = 'authenticated');
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenues ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Add performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_vehicles_organization ON vehicles(organization_id);
CREATE INDEX idx_drivers_organization ON drivers(organization_id);
CREATE INDEX idx_activities_organization ON activities(organization_id);
CREATE INDEX idx_revenues_organization ON revenues(organization_id);
CREATE INDEX idx_expenses_organization ON expenses(organization_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name) VALUES ('vehicle-photos', 'Vehicle Photos') ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('driver-documents', 'Driver Documents') ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('payment-proofs', 'Payment Proofs') ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name) VALUES ('expense-attachments', 'Expense Attachments') ON CONFLICT DO NOTHING;

-- Continue RLS policies
CREATE POLICY "Users can view organization vehicles" ON vehicles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND organization_id = vehicles.organization_id
        )
    );

CREATE POLICY "Users can manage organization vehicles" ON vehicles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND organization_id = vehicles.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Drivers can view assigned vehicles" ON vehicles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND assigned_vehicle_id = vehicles.id
            AND role = 'driver'
        )
    );

CREATE POLICY "Users can view organization drivers" ON drivers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND organization_id = drivers.organization_id
        )
    );

CREATE POLICY "Users can manage organization drivers" ON drivers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND organization_id = drivers.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can view organization activities" ON activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND organization_id = activities.organization_id
        )
    );

CREATE POLICY "Users can manage organization activities" ON activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND organization_id = activities.organization_id
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Drivers can view their activities" ON activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM drivers
            WHERE user_id = auth.uid()
            AND id = activities.driver_id
        )
    );

CREATE POLICY "Drivers can create activities" ON activities
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM drivers
            WHERE user_id = auth.uid()
            AND id = driver_id
        )
    );

-- Storage policies
CREATE POLICY "Users can upload vehicle photos" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vehicle-photos'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager', 'driver')
        )
    );

CREATE POLICY "Users can read vehicle photos" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'vehicle-photos'
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can upload driver documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'driver-documents'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins and owners can read driver documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'driver-documents'
        AND EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Users can upload payment proofs" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'payment-proofs'
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can read payment proofs" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'payment-proofs'
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can upload expense attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'expense-attachments'
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can read expense attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'expense-attachments'
        AND EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid()
        )
    );
