-- Create districts table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    district_code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create district performance table
CREATE TABLE IF NOT EXISTS district_performance (
    id SERIAL PRIMARY KEY,
    district_code VARCHAR(50) NOT NULL,
    month DATE NOT NULL,
    total_workers INTEGER NOT NULL,
    active_workers INTEGER NOT NULL,
    job_cards_issued INTEGER NOT NULL,
    work_completed DECIMAL(5,2) NOT NULL,
    average_wage DECIMAL(10,2) NOT NULL,
    total_expenditure DECIMAL(15,2) NOT NULL,
    person_days_generated INTEGER NOT NULL,
    api_last_fetched TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_code) REFERENCES districts(district_code),
    UNIQUE(district_code, month)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_district_code ON district_performance(district_code);
CREATE INDEX IF NOT EXISTS idx_month ON district_performance(month);
CREATE INDEX IF NOT EXISTS idx_district_month ON district_performance(district_code, month);

-- Create cache table for API responses
CREATE TABLE IF NOT EXISTS api_cache (
    id SERIAL PRIMARY KEY,
    cache_key VARCHAR(255) UNIQUE NOT NULL,
    cache_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cache_key ON api_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_expires_at ON api_cache(expires_at);