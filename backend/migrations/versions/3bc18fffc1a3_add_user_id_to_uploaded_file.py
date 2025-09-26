"""add user_id to uploaded_file

Revision ID: 3bc18fffc1a3
Revises: c903d73d2476
Create Date: 2025-09-22 15:38:08.476874

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3bc18fffc1a3'
down_revision = 'c903d73d2476'
branch_labels = None
depends_on = None


def upgrade():
    # Only add user_id to uploaded_file and create FK to user
    op.add_column('uploaded_file', sa.Column('user_id', sa.Integer(), nullable=False))
    op.create_foreign_key(
        'uploaded_file_user_id_fkey',
        'uploaded_file',
        'user',
        ['user_id'],
        ['id']
    )


def downgrade():
    # Drop FK then column added in this migration
    op.drop_constraint('uploaded_file_user_id_fkey', 'uploaded_file', type_='foreignkey')
    op.drop_column('uploaded_file', 'user_id')
