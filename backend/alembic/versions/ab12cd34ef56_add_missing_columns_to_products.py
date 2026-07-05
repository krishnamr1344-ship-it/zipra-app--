"""add_missing_columns_to_products

Revision ID: ab12cd34ef56
Revises:
Create Date: 2026-07-05 13:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ab12cd34ef56"
down_revision: Union[str, Sequence[str], None] = "c53b9a3f7d21"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='products' AND column_name='stock_quantity'
            ) THEN
                ALTER TABLE products ADD COLUMN stock_quantity INTEGER NOT NULL DEFAULT 0;
            END IF;
        END $$;
    """)
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='products' AND column_name='updated_at'
            ) THEN
                ALTER TABLE products ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
            END IF;
        END $$;
    """)


def downgrade() -> None:
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS stock_quantity")
    op.execute("ALTER TABLE products DROP COLUMN IF EXISTS updated_at")
