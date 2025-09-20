import pytest
import json
from datetime import date, timedelta
from app.db.models.user import User
from app.db.models.checklist import Checklist, Category, Item
from app.core.extensions import db


@pytest.fixture
def test_user_with_tasks(app):
    """Create a test user with various tasks for testing."""
    user = User(
        email='tasks@example.com',
        username='taskuser',
        yearofbirth=1990,
        educational_level='Bachelor'
    )
    user.set_password('TestPassword123')
    
    db.session.add(user)
    db.session.commit()
    
    # Create checklist
    checklist = Checklist(
        user_id=user.id,
        title='Test Checklist',
        overall_deadline=date.today() + timedelta(days=30)
    )
    db.session.add(checklist)
    db.session.commit()
    
    # Create categories
    category1 = Category(checklist_id=checklist.id, title='Documents')
    category2 = Category(checklist_id=checklist.id, title='Forms')
    db.session.add_all([category1, category2])
    db.session.commit()
    
    # Create various tasks with different statuses and deadlines
    today = date.today()
    
    # Pending tasks (not completed, deadline in future or no deadline)
    pending_task1 = Item(
        category_id=category1.id,
        title='Pending Task 1',
        description='A pending task',
        deadline=today + timedelta(days=5),
        is_completed=False
    )
    
    pending_task2 = Item(
        category_id=category1.id,
        title='Pending Task 2',
        description='Another pending task',
        deadline=None,  # No deadline
        is_completed=False
    )
    
    # Done tasks (completed)
    done_task1 = Item(
        category_id=category1.id,
        title='Done Task 1',
        description='A completed task',
        deadline=today + timedelta(days=3),
        is_completed=True
    )
    
    done_task2 = Item(
        category_id=category2.id,
        title='Done Task 2',
        description='Another completed task',
        deadline=today - timedelta(days=1),
        is_completed=True
    )
    
    # Overdue tasks (not completed, deadline in past)
    overdue_task1 = Item(
        category_id=category1.id,
        title='Overdue Task 1',
        description='An overdue task',
        deadline=today - timedelta(days=2),
        is_completed=False
    )
    
    overdue_task2 = Item(
        category_id=category2.id,
        title='Overdue Task 2',
        description='Another overdue task',
        deadline=today - timedelta(days=5),
        is_completed=False
    )
    
    db.session.add_all([
        pending_task1, pending_task2,
        done_task1, done_task2,
        overdue_task1, overdue_task2
    ])
    db.session.commit()
    
    return {
        'user': user,
        'checklist': checklist,
        'categories': [category1, category2],
        'tasks': {
            'pending': [pending_task1, pending_task2],
            'done': [done_task1, done_task2],
            'overdue': [overdue_task1, overdue_task2]
        }
    }


@pytest.fixture
def auth_headers_tasks(client, test_user_with_tasks):
    """Get authentication headers for the test user with tasks."""
    response = client.post('/auth/login', json={
        'email': 'tasks@example.com',
        'password': 'TestPassword123'
    })
    
    data = response.get_json()
    access_token = data['data']['access_token']
    
    return {'Authorization': f'Bearer {access_token}'}


class TestTasksSummaryEndpoint:
    """Test cases for the tasks summary endpoint."""
    
    def test_get_pending_tasks(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test fetching pending tasks."""
        response = client.get('/checklists/tasks-summary?status=pending', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert 'tasks' in data
        assert 'pagination' in data
        assert len(data['tasks']) == 2  # Two pending tasks
        
        # Check task structure
        task = data['tasks'][0]
        assert 'id' in task
        assert 'title' in task
        assert 'checklist_id' in task
        assert 'category_id' in task
        assert 'deadline' in task
        assert 'is_completed' in task
        
        # Check that all returned tasks are pending
        for task in data['tasks']:
            assert task['is_completed'] == False
            # Either no deadline or deadline >= today
            if task['deadline']:
                task_date = date.fromisoformat(task['deadline'])
                assert task_date >= date.today()
    
    def test_get_done_tasks(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test fetching done tasks."""
        response = client.get('/checklists/tasks-summary?status=done', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['tasks']) == 2  # Two done tasks
        
        # Check that all returned tasks are done
        for task in data['tasks']:
            assert task['is_completed'] == True
    
    def test_get_overdue_tasks(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test fetching overdue tasks."""
        response = client.get('/checklists/tasks-summary?status=overdue', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['tasks']) == 2  # Two overdue tasks
        
        # Check that all returned tasks are overdue
        for task in data['tasks']:
            assert task['is_completed'] == False
            assert task['deadline'] is not None
            task_date = date.fromisoformat(task['deadline'])
            assert task_date < date.today()
    
    def test_default_status_pending(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test that default status is pending when no status specified."""
        response = client.get('/checklists/tasks-summary', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['tasks']) == 2  # Two pending tasks
        for task in data['tasks']:
            assert task['is_completed'] == False
    
    def test_invalid_status(self, client, auth_headers_tasks):
        """Test that invalid status returns 400 error."""
        response = client.get('/checklists/tasks-summary?status=invalid', headers=auth_headers_tasks)
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
        assert 'Invalid status' in data['error']
    
    def test_pagination(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test pagination functionality."""
        # Test first page
        response = client.get('/checklists/tasks-summary?status=pending&page=1&per_page=1', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['tasks']) == 1
        assert data['pagination']['page'] == 1
        assert data['pagination']['per_page'] == 1
        assert data['pagination']['total'] == 2
        assert data['pagination']['pages'] == 2
        assert data['pagination']['has_next'] == True
        assert data['pagination']['has_prev'] == False
        
        # Test second page
        response = client.get('/checklists/tasks-summary?status=pending&page=2&per_page=1', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['tasks']) == 1
        assert data['pagination']['page'] == 2
        assert data['pagination']['has_next'] == False
        assert data['pagination']['has_prev'] == True
    
    def test_per_page_limit(self, client, auth_headers_tasks):
        """Test that per_page is limited to 100."""
        response = client.get('/checklists/tasks-summary?per_page=200', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert data['pagination']['per_page'] == 100  # Should be capped at 100
    
    def test_unauthorized_access(self, client):
        """Test that unauthorized access returns 401."""
        response = client.get('/checklists/tasks-summary')
        
        assert response.status_code == 401
    
    def test_empty_results(self, client, auth_headers_tasks):
        """Test behavior when no tasks match the criteria."""
        # Create a user with no tasks
        user = User(
            email='empty@example.com',
            username='emptyuser',
            yearofbirth=1990,
            educational_level='Bachelor'
        )
        user.set_password('TestPassword123')
        
        db.session.add(user)
        db.session.commit()
        
        # Login as this user
        response = client.post('/auth/login', json={
            'email': 'empty@example.com',
            'password': 'TestPassword123'
        })
        
        data = response.get_json()
        access_token = data['data']['access_token']
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # Try to get tasks
        response = client.get('/checklists/tasks-summary?status=pending', headers=headers)
        
        assert response.status_code == 200
        data = response.get_json()
        
        assert len(data['tasks']) == 0
        assert data['pagination']['total'] == 0
        assert data['pagination']['pages'] == 0
    
    def test_task_ordering(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test that tasks are ordered by deadline (ascending, nulls last) then by id."""
        response = client.get('/checklists/tasks-summary?status=pending', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        tasks = data['tasks']
        assert len(tasks) == 2
        
        # First task should have a deadline, second should have no deadline (nulls last)
        assert tasks[0]['deadline'] is not None
        assert tasks[1]['deadline'] is None
    
    def test_task_data_structure(self, client, auth_headers_tasks, test_user_with_tasks):
        """Test that returned task data has the correct structure."""
        response = client.get('/checklists/tasks-summary?status=pending', headers=auth_headers_tasks)
        
        assert response.status_code == 200
        data = response.get_json()
        
        task = data['tasks'][0]
        
        # Check required fields
        assert isinstance(task['id'], int)
        assert isinstance(task['title'], str)
        assert isinstance(task['checklist_id'], int)
        assert isinstance(task['category_id'], int)
        assert isinstance(task['is_completed'], bool)
        
        # Check optional deadline field
        if task['deadline']:
            assert isinstance(task['deadline'], str)
            # Should be valid ISO date
            date.fromisoformat(task['deadline'])
    
    def test_pagination_edge_cases(self, client, auth_headers_tasks):
        """Test pagination edge cases."""
        # Test page 0 (should default to 1)
        response = client.get('/checklists/tasks-summary?page=0', headers=auth_headers_tasks)
        assert response.status_code == 200
        data = response.get_json()
        assert data['pagination']['page'] == 1
        
        # Test negative page (should default to 1)
        response = client.get('/checklists/tasks-summary?page=-1', headers=auth_headers_tasks)
        assert response.status_code == 200
        data = response.get_json()
        assert data['pagination']['page'] == 1
        
        # Test page beyond available pages
        response = client.get('/checklists/tasks-summary?page=999', headers=auth_headers_tasks)
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['tasks']) == 0
        assert data['pagination']['page'] == 999
