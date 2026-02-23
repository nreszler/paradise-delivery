-- Paradise Delivery Database Schema
-- SQLite compatible

-- Users table (customers, drivers, restaurant admins)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'driver', 'restaurant_admin', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customer profiles
CREATE TABLE customer_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    default_address TEXT,
    default_latitude DECIMAL(10, 8),
    default_longitude DECIMAL(11, 8),
    payment_method_id VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Driver profiles
CREATE TABLE driver_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    license_number VARCHAR(100),
    license_expiry DATE,
    vehicle_year INTEGER,
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_color VARCHAR(50),
    license_plate VARCHAR(20),
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    background_check_status VARCHAR(20) DEFAULT 'pending' CHECK (background_check_status IN ('pending', 'approved', 'rejected')),
    onboarding_status VARCHAR(20) DEFAULT 'applied' CHECK (onboarding_status IN ('applied', 'documents_pending', 'background_check', 'approved', 'rejected', 'active', 'inactive')),
    bank_account_number VARCHAR(100),
    bank_routing_number VARCHAR(100),
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    rating DECIMAL(2, 1) DEFAULT 5.0,
    is_online BOOLEAN DEFAULT 0,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Driver documents
CREATE TABLE driver_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('license', 'insurance', 'vehicle_registration', 'background_check')),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    verified BOOLEAN DEFAULT 0,
    verified_at DATETIME,
    verified_by INTEGER,
    notes TEXT,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id) ON DELETE CASCADE
);

-- Restaurants
CREATE TABLE restaurants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    cuisine_type VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Paradise',
    state VARCHAR(50) DEFAULT 'CA',
    zip VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    commission_rate DECIMAL(5, 2) DEFAULT 18.00,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'suspended')),
    rating DECIMAL(2, 1) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    logo_url VARCHAR(500),
    business_license VARCHAR(100),
    tax_id VARCHAR(100),
    bank_account_number VARCHAR(100),
    bank_routing_number VARCHAR(100),
    owner_user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

-- Restaurant hours
CREATE TABLE restaurant_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Menu categories
CREATE TABLE menu_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

-- Menu items
CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    category_id INTEGER,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    dietary_info TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES menu_categories(id)
);

-- Orders
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    restaurant_id INTEGER NOT NULL,
    driver_id INTEGER,
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'refunded')),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    tip_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    distance_miles DECIMAL(4, 2),
    estimated_delivery_time DATETIME,
    actual_delivery_time DATETIME,
    special_instructions TEXT,
    payment_intent_id VARCHAR(100),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);

-- Order items
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    special_instructions TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

-- Driver earnings
CREATE TABLE driver_earnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    order_id INTEGER,
    earning_type VARCHAR(30) NOT NULL CHECK (earning_type IN ('delivery_base', 'delivery_mileage', 'tip', 'bonus', 'adjustment')),
    amount DECIMAL(10, 2) NOT NULL,
    distance_miles DECIMAL(4, 2),
    description TEXT,
    week_start_date DATE,
    is_paid BOOLEAN DEFAULT 0,
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Prop 22 compliance tracking
CREATE TABLE prop22_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    engaged_hours DECIMAL(5, 2) DEFAULT 0,
    engaged_miles DECIMAL(6, 2) DEFAULT 0,
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    guaranteed_minimum DECIMAL(10, 2) DEFAULT 0,
    true_up_amount DECIMAL(10, 2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT 0,
    paid_at DATETIME,
    FOREIGN KEY (driver_id) REFERENCES driver_profiles(id)
);

-- Payouts to restaurants
CREATE TABLE restaurant_payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_id INTEGER NOT NULL,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    total_orders INTEGER DEFAULT 0,
    gross_revenue DECIMAL(10, 2) DEFAULT 0,
    commission_amount DECIMAL(10, 2) DEFAULT 0,
    net_payout DECIMAL(10, 2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT 0,
    paid_at DATETIME,
    stripe_transfer_id VARCHAR(100),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Admin audit log
CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_orders_driver ON orders(driver_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_driver_earnings_driver ON driver_earnings(driver_id);
CREATE INDEX idx_driver_earnings_week ON driver_earnings(week_start_date);
CREATE INDEX idx_prop22_driver_week ON prop22_tracking(driver_id, week_start_date);

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
INSERT INTO users (email, password_hash, first_name, last_name, role, status) 
VALUES ('admin@paradisedelivery.com', '$2a$10$YourHashedPasswordHere', 'Admin', 'User', 'admin', 'active');