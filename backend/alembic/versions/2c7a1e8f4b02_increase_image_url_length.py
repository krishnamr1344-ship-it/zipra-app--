"""increase image_url length to 2048

Revision ID: 2c7a1e8f4b02
Revises: 361a36f0c175
Create Date: 2026-07-05 03:52:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2c7a1e8f4b02"
down_revision: Union[str, Sequence[str], None] = "361a36f0c175"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("products", "image_url", type_=sa.String(2048), existing_type=sa.String(500))


def downgrade() -> None:
    op.alter_column("products", "image_url", type_=sa.String(500), existing_type=sa.String(2048))
