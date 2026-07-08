"""fix order_status_history.status column type to match model Enum

Revision ID: e399ff389268
Revises: 3d8b2f9c5a01
Create Date: 2026-07-05 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op


revision: str = "e399ff389268"
down_revision: Union[str, Sequence[str], None] = "3d8b2f9c5a01"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE order_status_history ALTER COLUMN status TYPE orderstatus USING status::orderstatus")


def downgrade() -> None:
    op.execute("ALTER TABLE order_status_history ALTER COLUMN status TYPE VARCHAR USING status::text")
