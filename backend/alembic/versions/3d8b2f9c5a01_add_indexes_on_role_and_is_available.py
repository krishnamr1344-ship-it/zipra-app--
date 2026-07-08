"""add indexes on users.role and products.is_available

Revision ID: 3d8b2f9c5a01
Revises: 2c7a1e8f4b02
Create Date: 2026-07-05 03:55:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "3d8b2f9c5a01"
down_revision: Union[str, Sequence[str], None] = "2c7a1e8f4b02"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("idx_users_role", "users", ["role"])
    op.create_index("idx_products_available", "products", ["is_available"])


def downgrade() -> None:
    op.drop_index("idx_users_role", table_name="users")
    op.drop_index("idx_products_available", table_name="products")
