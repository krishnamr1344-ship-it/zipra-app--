"""reconcile_delivery_zones_schema

Revision ID: c3e4f5a60718
Revises: b2d3e4f5a607
Create Date: 2026-07-09 00:30:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c3e4f5a60718"
down_revision: Union[str, Sequence[str], None] = "b2d3e4f5a607"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("delivery_zones") as batch_op:
        batch_op.alter_column(
            "zone_name",
            new_column_name="name",
            existing_type=sa.String(length=100),
            type_=sa.String(length=255),
        )
        batch_op.alter_column(
            "geojson_data",
            new_column_name="coordinates",
            existing_type=sa.Text(),
            type_=sa.Text(),
        )
        batch_op.add_column(
            sa.Column("delivery_fee", sa.Numeric(10, 2), nullable=False, server_default="0")
        )
        batch_op.add_column(
            sa.Column("free_delivery_above", sa.Numeric(10, 2), nullable=False, server_default="0")
        )


def downgrade() -> None:
    with op.batch_alter_table("delivery_zones") as batch_op:
        batch_op.drop_column("free_delivery_above")
        batch_op.drop_column("delivery_fee")
        batch_op.alter_column(
            "coordinates",
            new_column_name="geojson_data",
            existing_type=sa.Text(),
            type_=sa.Text(),
        )
        batch_op.alter_column(
            "name",
            new_column_name="zone_name",
            existing_type=sa.String(length=255),
            type_=sa.String(length=100),
        )
