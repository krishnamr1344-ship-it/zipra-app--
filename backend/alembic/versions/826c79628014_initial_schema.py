"""initial_schema

Revision ID: 826c79628014
Revises:
Create Date: 2026-07-05 08:56:39.169140

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "826c79628014"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(100), unique=True, nullable=True),
        sa.Column("phone", sa.String(100), unique=True, nullable=True),
        sa.Column("firebase_uid", sa.String(), unique=True, nullable=True),
        sa.Column(
            "role",
            sa.Enum("customer", "shop_owner", "admin", name="userrole"),
            nullable=False,
            server_default="customer",
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_table(
        "products",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("shop_owner_id", sa.String(),
                  sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
        sa.Column("image_url", sa.String(2048), nullable=False, server_default=""),
        sa.Column("category", sa.String(100), nullable=False, server_default="General"),
        sa.Column("is_available", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("stock_quantity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_table(
        "orders",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("customer_id", sa.String(),
                  sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column(
            "status",
            sa.Enum("placed", "accepted", "preparing", "out_for_delivery",
                    "delivered", "cancelled", name="orderstatus"),
            nullable=False,
            server_default="placed",
        ),
        sa.Column("total_amount", sa.Numeric(10, 2), nullable=False),
        sa.Column("delivery_address", sa.Text(), nullable=False, server_default=""),
        sa.Column("payment_id", sa.String(200), nullable=False, server_default=""),
        sa.Column("razorpay_order_id", sa.String(200), nullable=False, server_default=""),
        sa.Column("idempotency_key", sa.String(200), nullable=False, server_default=""),
        sa.Column("payment_method", sa.String(50), nullable=False, server_default="online"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )
    op.create_table(
        "order_items",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("order_id", sa.String(),
                  sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("product_id", sa.String(),
                  sa.ForeignKey("products.id", ondelete="SET NULL"), nullable=True),
        sa.Column("product_name", sa.String(200), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(10, 2), nullable=False),
    )
    op.create_table(
        "order_status_history",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("order_id", sa.String(),
                  sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.text("now()")),
    )

    op.create_index("idx_products_shop_owner", "products", ["shop_owner_id"])
    op.create_index("idx_products_category", "products", ["category"])
    op.create_index("idx_orders_customer", "orders", ["customer_id"])
    op.create_index("idx_orders_status", "orders", ["status"])
    op.create_index("idx_order_items_order", "order_items", ["order_id"])
    op.create_index("idx_order_items_product", "order_items", ["product_id"])
    op.create_index("idx_order_status_history_order", "order_status_history", ["order_id"])
    op.create_index("idx_orders_idempotency", "orders", ["idempotency_key"])
    op.create_index("idx_users_role", "users", ["role"])
    op.create_index("idx_products_available", "products", ["is_available"])

    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
    """)
    for tbl in ("orders", "users", "products"):
        op.execute(f"""
            DROP TRIGGER IF EXISTS trigger_update_{tbl} ON {tbl}
        """)
        op.execute(f"""
            CREATE TRIGGER trigger_update_{tbl}
                BEFORE UPDATE ON {tbl}
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at()
        """)


def downgrade() -> None:
    op.execute("DROP TRIGGER IF EXISTS trigger_update_products ON products")
    op.execute("DROP TRIGGER IF EXISTS trigger_update_users ON users")
    op.execute("DROP TRIGGER IF EXISTS trigger_update_orders ON orders")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at")
    op.drop_table("order_status_history")
    op.drop_table("order_items")
    op.drop_table("orders")
    op.drop_table("products")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS orderstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
