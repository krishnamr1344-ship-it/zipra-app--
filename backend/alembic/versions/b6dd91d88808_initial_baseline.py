"""initial_baseline

Revision ID: b6dd91d88808
Revises:
Create Date: 2026-07-08 01:45:59.293963

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b6dd91d88808"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
