import pytest
from app.db.models import User, Checklist, Category, Item, UploadedFile
from app.core.extensions import db
import datetime

def test_create_checklist(app):
    """
    Test creating a new checklist and associating it with a user.
    """
    with app.app_context():
        user = User(
            username='testuser',
            email='test@example.com',
            password_hash='password',
            yearofbirth=2000,
            educational_level='Bachelor'
        )
        db.session.add(user)
        db.session.commit()

        checklist = Checklist(
            title="Test Checklist",
            user_id=user.id,
            overall_deadline=datetime.date(2025, 12, 31)
        )
        db.session.add(checklist)
        db.session.commit()

        assert checklist.id is not None
        assert checklist.title == "Test Checklist"
        assert checklist.user_id == user.id
        assert user.checklists[0] == checklist

def test_create_category(app):
    """
    Test creating a category and associating it with a checklist.
    """
    with app.app_context():
        user = User(
            username='testuser2',
            email='test2@example.com',
            password_hash='password',
            yearofbirth=2000,
            educational_level='Bachelor'
        )
        db.session.add(user)
        db.session.commit()
        checklist = Checklist(title="Category Checklist", user_id=user.id)
        db.session.add(checklist)
        db.session.commit()

        category = Category(title="Test Category", checklist_id=checklist.id)
        db.session.add(category)
        db.session.commit()

        assert category.id is not None
        assert category.title == "Test Category"
        assert category.checklist_id == checklist.id
        assert checklist.categories[0] == category

def test_create_item(app):
    """
    Test creating an item and associating it with a category.
    """
    with app.app_context():
        user = User(
            username='testuser3',
            email='test3@example.com',
            password_hash='password',
            yearofbirth=2000,
            educational_level='Bachelor'
        )
        db.session.add(user)
        db.session.commit()
        checklist = Checklist(title="Item Checklist", user_id=user.id)
        db.session.add(checklist)
        db.session.commit()
        category = Category(title="Item Category", checklist_id=checklist.id)
        db.session.add(category)
        db.session.commit()

        item = Item(
            title="Test Item",
            category_id=category.id,
            description="A test item.",
            deadline=datetime.date(2024, 1, 1),
            is_completed=False
        )
        db.session.add(item)
        db.session.commit()

        assert item.id is not None
        assert item.title == "Test Item"
        assert item.is_completed is False
        assert item.category_id == category.id
        assert category.items[0] == item

def test_create_uploaded_file(app):
    """
    Test creating an uploaded file record and associating it with an item.
    """
    with app.app_context():
        user = User(
            username='testuser4',
            email='test4@example.com',
            password_hash='password',
            yearofbirth=2000,
            educational_level='Bachelor'
        )
        db.session.add(user)
        db.session.commit()
        checklist = Checklist(title="File Checklist", user_id=user.id)
        db.session.add(checklist)
        db.session.commit()
        category = Category(title="File Category", checklist_id=checklist.id)
        db.session.add(category)
        db.session.commit()
        item = Item(title="File Item", category_id=category.id)
        db.session.add(item)
        db.session.commit()

        uploaded_file = UploadedFile(
            item_id=item.id,
            file_path="/path/to/file.pdf",
            original_filename="file.pdf"
        )
        db.session.add(uploaded_file)
        db.session.commit()

        assert uploaded_file.id is not None
        assert uploaded_file.original_filename == "file.pdf"
        assert uploaded_file.item_id == item.id
        assert item.uploaded_files[0] == uploaded_file

def test_cascade_delete(app):
    """
    Test that deleting a parent object cascades to children.
    """
    with app.app_context():
        # Setup
        user = User(
            username='testuser5',
            email='test5@example.com',
            password_hash='password',
            yearofbirth=2000,
            educational_level='Bachelor'
        )
        db.session.add(user)
        db.session.commit()
        checklist = Checklist(title="Cascade Checklist", user_id=user.id)
        db.session.add(checklist)
        db.session.commit()
        category = Category(title="Cascade Category", checklist_id=checklist.id)
        db.session.add(category)
        db.session.commit()
        item = Item(title="Cascade Item", category_id=category.id)
        db.session.add(item)
        db.session.commit()

        checklist_id = checklist.id
        category_id = category.id
        item_id = item.id

        # Action
        db.session.delete(checklist)
        db.session.commit()

        # Assert
        assert db.session.get(Checklist, checklist_id) is None
        assert db.session.get(Category, category_id) is None
        assert db.session.get(Item, item_id) is None
