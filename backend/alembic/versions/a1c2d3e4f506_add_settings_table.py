"""add_settings_table

Revision ID: a1c2d3e4f506
Revises: b6dd91d88808
Create Date: 2026-07-09 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a1c2d3e4f506"
down_revision: Union[str, Sequence[str], None] = "b6dd91d88808"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "settings",
        sa.Column("key", sa.String(length=100), primary_key=True, nullable=False),
        sa.Column("value", sa.Text(), nullable=True),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_table("settings")
