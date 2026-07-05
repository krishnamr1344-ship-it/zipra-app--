"""increase phone column length to 100

Revision ID: 361a36f0c175
Revises: 826c79628014
Create Date: 2026-07-05 03:39:29.475192

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "361a36f0c175"
down_revision: Union[str, Sequence[str], None] = "826c79628014"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "phone", type_=sa.String(100), existing_type=sa.String(20))


def downgrade() -> None:
    op.alter_column("users", "phone", type_=sa.String(20), existing_type=sa.String(100))
