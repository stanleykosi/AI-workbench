-- Add source and tiingo_fetch_id columns to datasets table
ALTER TABLE datasets 
ADD COLUMN source dataset_source DEFAULT 'upload',
ADD COLUMN tiingo_fetch_id UUID;

-- Create tiingo_fetches table
CREATE TABLE tiingo_fetches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    data_type TEXT NOT NULL,
    symbol TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    frequency TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create enum for dataset_source if it doesn't exist
DO $$ BEGIN
    CREATE TYPE dataset_source AS ENUM ('upload', 'tiingo', 'manual');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraint for tiingo_fetch_id
ALTER TABLE datasets 
ADD CONSTRAINT datasets_tiingo_fetch_id_fkey 
FOREIGN KEY (tiingo_fetch_id) REFERENCES tiingo_fetches(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_datasets_source ON datasets(source);
CREATE INDEX idx_datasets_tiingo_fetch_id ON datasets(tiingo_fetch_id);
CREATE INDEX idx_tiingo_fetches_project_id ON tiingo_fetches(project_id);
CREATE INDEX idx_tiingo_fetches_symbol ON tiingo_fetches(symbol);
CREATE INDEX idx_tiingo_fetches_data_type ON tiingo_fetches(data_type);
