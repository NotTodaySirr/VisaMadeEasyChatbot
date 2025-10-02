"""Add password reset tokens table

Revision ID: a52d91c3d412
Revises: f35eb0395d68
Create Date: 2025-09-30 20:21:35.507763

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a52d91c3d412'
down_revision = 'f35eb0395d68'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'password_reset_token',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token_hash', sa.String(length=128), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('consumed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token_hash')
    )
    op.create_index('ix_password_reset_token_user_id', 'password_reset_token', ['user_id'])
    op.create_index('ix_password_reset_token_expires_at', 'password_reset_token', ['expires_at'])


def downgrade():
    op.drop_index('ix_password_reset_token_expires_at', table_name='password_reset_token')
    op.drop_index('ix_password_reset_token_user_id', table_name='password_reset_token')
    op.drop_table('password_reset_token')

