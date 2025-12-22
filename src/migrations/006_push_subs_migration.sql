CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  endpoint TEXT UNIQUE NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  order_key TEXT,
  admin_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_order_key ON push_subscriptions(order_key) WHERE order_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_push_admin_username ON push_subscriptions(admin_username) WHERE admin_username IS NOT NULL;