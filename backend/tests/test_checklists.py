import pytest
from app.db.models.user import User
from app.db.models.checklist import Checklist, Category, Item
from app.core.extensions import db

@pytest.fixture
def test_user2(app):
    """Create a second test user."""
    user = User(
        email='test2@example.com',
        username='testuser2',
        yearofbirth=1991,
        educational_level='Doctorate'
    )
    user.set_password('TestPassword123')
    
    db.session.add(user)
    db.session.commit()
    return user

@pytest.fixture
def auth_headers2(client, test_user2):
    """Get authentication headers for second test user."""
    response = client.post('/auth/login', json={
        'email': 'test2@example.com',
        'password': 'TestPassword123'
    })
    
    data = response.get_json()
    access_token = data['data']['access_token']
    
    return {'Authorization': f'Bearer {access_token}'}

@pytest.fixture
def sample_checklist(test_user):
    """Create a sample checklist for the test user."""
    checklist = Checklist(user_id=test_user.id, title="Sample Checklist")
    db.session.add(checklist)
    db.session.commit()
    return checklist

class TestChecklists:
    """Test checklist endpoints."""

    def test_create_checklist(self, client, auth_headers):
        """Test successful checklist creation."""
        data = {'title': 'New Test Checklist'}
        response = client.post('/checklists/', json=data, headers=auth_headers)
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data['title'] == 'New Test Checklist'

    def test_get_checklists(self, client, auth_headers, sample_checklist):
        """Test getting all checklists for a user."""
        response = client.get('/checklists/', headers=auth_headers)
        assert response.status_code == 200
        json_data = response.get_json()
        assert len(json_data) == 1
        assert json_data[0]['title'] == sample_checklist.title

    def test_get_checklist_unauthorized(self, client, auth_headers2, sample_checklist):
        """Test that a user cannot access another user's checklist."""
        response = client.get(f'/checklists/{sample_checklist.id}', headers=auth_headers2)
        assert response.status_code == 404

    def test_update_checklist(self, client, auth_headers, sample_checklist):
        """Test updating a checklist."""
        data = {'title': 'Updated Checklist Title'}
        response = client.patch(f'/checklists/{sample_checklist.id}', json=data, headers=auth_headers)
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['title'] == 'Updated Checklist Title'
        
    def test_delete_checklist(self, client, auth_headers, sample_checklist):
        """Test deleting a checklist."""
        response = client.delete(f'/checklists/{sample_checklist.id}', headers=auth_headers)
        assert response.status_code == 200
        # Verify it's deleted
        response = client.get(f'/checklists/{sample_checklist.id}', headers=auth_headers)
        assert response.status_code == 404

class TestCategories:
    """Test category endpoints."""

    @pytest.fixture
    def sample_category(self, sample_checklist):
        category = Category(checklist_id=sample_checklist.id, title="Sample Category")
        db.session.add(category)
        db.session.commit()
        return category

    def test_create_category(self, client, auth_headers, sample_checklist):
        data = {'title': 'New Category'}
        response = client.post(f'/checklists/{sample_checklist.id}/categories', json=data, headers=auth_headers)
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data['title'] == 'New Category'

    def test_get_categories(self, client, auth_headers, sample_checklist, sample_category):
        response = client.get(f'/checklists/{sample_checklist.id}/categories', headers=auth_headers)
        assert response.status_code == 200
        json_data = response.get_json()
        assert len(json_data) == 1
        assert json_data[0]['title'] == 'Sample Category'

    def test_update_category(self, client, auth_headers, sample_category):
        """Test updating a category."""
        data = {'title': 'Updated Category Title'}
        response = client.patch(f'/checklists/categories/{sample_category.id}', json=data, headers=auth_headers)
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['title'] == 'Updated Category Title'

class TestItems:
    """Test item endpoints."""

    @pytest.fixture
    def sample_category(self, sample_checklist):
        category = Category(checklist_id=sample_checklist.id, title="Sample Category for Items")
        db.session.add(category)
        db.session.commit()
        return category
        
    @pytest.fixture
    def sample_item(self, sample_category):
        item = Item(category_id=sample_category.id, title="Sample Item", description="A sample item.")
        db.session.add(item)
        db.session.commit()
        return item

    def test_create_item(self, client, auth_headers, sample_category):
        data = {'title': 'New Item', 'description': 'Item description'}
        response = client.post(f'/checklists/categories/{sample_category.id}/items', json=data, headers=auth_headers)
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data['title'] == 'New Item'

    def test_update_item(self, client, auth_headers, sample_item):
        data = {'title': 'Updated Item Title', 'is_completed': True}
        response = client.patch(f'/checklists/items/{sample_item.id}', json=data, headers=auth_headers)
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['title'] == 'Updated Item Title'
        assert json_data['is_completed'] is True

    def test_delete_item(self, client, auth_headers, sample_item):
        response = client.delete(f'/checklists/items/{sample_item.id}', headers=auth_headers)
        assert response.status_code == 200
        # Verify it's deleted
        item = db.session.get(Item, sample_item.id)
        assert item is None
