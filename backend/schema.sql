-- ===========================================================================
-- LEGACY / REFERENCE ONLY — NOT USED BY THE APPLICATION
-- ---------------------------------------------------------------------------
-- The live database schema is managed exclusively by Alembic migrations
-- (see backend/alembic/). This file is a stale, hand-written snapshot that
-- DIVERGES from the actual SQLAlchemy models (backend/app/models.py) and must
-- NOT be used to create or migrate the database. It is kept only as a rough
-- reference and will be removed during the production cleanup audit.
-- ===========================================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL DEFAULT '',
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    firebase_uid TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'shop_owner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    shop_owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT NOT NULL DEFAULT '',
    mrp DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT '',
    rating DECIMAL(3,2) NOT NULL DEFAULT 0,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    category TEXT NOT NULL DEFAULT 'General',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    customer_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    -- Must stay in sync with OrderStatus enum in models.py
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    total_amount DECIMAL(10,2) NOT NULL,
    delivery_address TEXT NOT NULL DEFAULT '',
    payment_id TEXT NOT NULL DEFAULT '',
    razorpay_order_id TEXT NOT NULL DEFAULT '',
    idempotency_key TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT 'online',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL
);

-- Order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_shop_owner ON products(shop_owner_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
-- firebase_uid and phone are already indexed via UNIQUE constraint
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON orders(idempotency_key);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Addresses table
CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label TEXT NOT NULL DEFAULT 'Home',
    name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address_line1 TEXT NOT NULL,
    address_line2 TEXT NOT NULL DEFAULT '',
    landmark TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT '',
    pincode TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'info',
    title TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    cta TEXT NOT NULL DEFAULT 'Shop Now',
    link TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    color TEXT NOT NULL DEFAULT 'from-[#FF9A3D] to-[#F26400]',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    image TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Triggers for new tables
DROP TRIGGER IF EXISTS trigger_update_cart_items ON cart_items;
CREATE TRIGGER trigger_update_cart_items
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_addresses ON addresses;
CREATE TRIGGER trigger_update_addresses
    BEFORE UPDATE ON addresses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS trigger_update_orders ON orders;
CREATE TRIGGER trigger_update_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_users ON users;
CREATE TRIGGER trigger_update_users
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_products ON products;
CREATE TRIGGER trigger_update_products
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
