"""Initial migration

Revision ID: b422f2f75b82
Revises: 
Create Date: 2025-02-11 18:01:01.857932

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b422f2f75b82'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('created_at', sa.Date(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('email')
    )
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_index('idx_user_email', ['email'], unique=False)
        batch_op.create_index('idx_user_name', ['name'], unique=False)

    op.create_table('categories',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('created_by', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.Date(), nullable=False),
    sa.ForeignKeyConstraint(['created_by'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('categories', schema=None) as batch_op:
        batch_op.create_index('idx_category_created_by', ['created_by'], unique=False)
        batch_op.create_index('idx_category_name_created_by', ['name', 'created_by'], unique=False)

    op.create_table('tasks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('task', sa.String(length=1000), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('time', sa.String(length=100), nullable=False),
    sa.Column('category_id', sa.Integer(), nullable=False),
    sa.Column('is_complete', sa.Boolean(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.create_index('idx_task_category_id', ['category_id'], unique=False)
        batch_op.create_index('idx_task_complete_user', ['is_complete', 'user_id'], unique=False)
        batch_op.create_index('idx_task_date_user', ['date', 'user_id'], unique=False)
        batch_op.create_index('idx_task_user_id', ['user_id'], unique=False)

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_index('idx_task_user_id')
        batch_op.drop_index('idx_task_date_user')
        batch_op.drop_index('idx_task_complete_user')
        batch_op.drop_index('idx_task_category_id')

    op.drop_table('tasks')
    with op.batch_alter_table('categories', schema=None) as batch_op:
        batch_op.drop_index('idx_category_name_created_by')
        batch_op.drop_index('idx_category_created_by')

    op.drop_table('categories')
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_index('idx_user_name')
        batch_op.drop_index('idx_user_email')

    op.drop_table('users')
    # ### end Alembic commands ###
