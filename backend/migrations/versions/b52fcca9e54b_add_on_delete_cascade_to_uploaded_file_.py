"""add ON DELETE CASCADE to uploaded_file.item_id

Revision ID: b52fcca9e54b
Revises: 6e3f97e72a41
Create Date: 2025-09-19 17:34:22.774437

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b52fcca9e54b'
down_revision = '6e3f97e72a41'
branch_labels = None
depends_on = None


def upgrade():
    # Drop existing FK and recreate with ON DELETE CASCADE
    op.drop_constraint('uploaded_file_item_id_fkey', 'uploaded_file', type_='foreignkey')
    op.create_foreign_key(
        'uploaded_file_item_id_fkey',
        'uploaded_file', 'item',
        ['item_id'], ['id'],
        ondelete='CASCADE'
    )


def downgrade():
    # Revert to FK without ON DELETE CASCADE
    op.drop_constraint('uploaded_file_item_id_fkey', 'uploaded_file', type_='foreignkey')
    op.create_foreign_key(
        'uploaded_file_item_id_fkey',
        'uploaded_file', 'item',
        ['item_id'], ['id']
    )
