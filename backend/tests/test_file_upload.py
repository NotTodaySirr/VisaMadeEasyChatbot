import pytest
import os
import tempfile
import shutil
import io
from unittest.mock import patch, MagicMock
from flask import Flask
from app import create_app
from app.core.extensions import db
from app.db.models import User, UploadedFile
from werkzeug.security import generate_password_hash

class TestFileUploadIntegration:
    """Integration tests for file upload functionality."""
    
    def setup_method(self):
        """Set up test environment."""
        self.app = create_app('testing')
        self.client = self.app.test_client()
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        # Create test database
        db.create_all()
        
        # Create test user
        self.test_user = User(
            email='test@example.com',
            username='testuser',
            password_hash=generate_password_hash('testpassword'),
            yearofbirth=1990,
            educational_level='Bachelor\'s Degree'
        )
        db.session.add(self.test_user)
        db.session.commit()
         
        # Get JWT token
        response = self.client.post('/auth/login', json={
            'email': 'test@example.com',
            'password': 'testpassword'
        })
        self.token = response.json['data']['access_token']
        self.headers = {'Authorization': f'Bearer {self.token}'}
        
        # Create temp directory for uploads
        self.temp_dir = tempfile.mkdtemp()
        self.app.config['UPLOAD_FOLDER'] = self.temp_dir
    
    def teardown_method(self):
        """Clean up test environment."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_upload_file_success(self):
        """Test successful file upload."""
        # Create test file
        test_file = io.BytesIO(b'test file content')
        test_file.name = 'test.txt'
        
        response = self.client.post('/files/upload', 
            data={'file': (test_file, 'test.txt')},
            headers=self.headers
        )
        
        assert response.status_code == 201
        data = response.json
        assert 'message' in data
        assert 'file' in data
        assert data['file']['original_filename'] == 'test.txt'
        assert data['file']['user_id'] == self.test_user.id
        
        # Verify file was saved
        uploaded_file = UploadedFile.query.first()
        assert uploaded_file is not None
        assert os.path.exists(uploaded_file.file_path)
    
    def test_upload_file_no_file(self):
        """Test upload without file."""
        response = self.client.post('/files/upload', 
            headers=self.headers
        )
        
        assert response.status_code == 400
        assert 'No file provided' in response.json['error']
    
    def test_upload_file_invalid_type(self):
        """Test upload with invalid file type."""
        test_file = io.BytesIO(b'malicious content')
        test_file.name = 'malicious.exe'
        
        response = self.client.post('/files/upload', 
            data={'file': (test_file, 'malicious.exe')},
            headers=self.headers
        )
        
        assert response.status_code == 400
        assert 'File type not allowed' in response.json['error']
    
    def test_upload_file_too_large(self):
        """Test upload with file too large."""
        # Create large file content
        large_content = b'x' * (17 * 1024 * 1024)  # 17MB
        test_file = io.BytesIO(large_content)
        test_file.name = 'large.txt'
        
        response = self.client.post('/files/upload', 
            data={'file': (test_file, 'large.txt')},
            headers=self.headers
        )
        
        assert response.status_code == 413
        assert 'exceeds maximum' in response.json['error']
    
    def test_download_file_success(self):
        """Test successful file download."""
        # First upload a file
        test_file = io.BytesIO(b'test content')
        test_file.name = 'test.txt'
        
        upload_response = self.client.post('/files/upload', 
            data={'file': (test_file, 'test.txt')},
            headers=self.headers
        )
        
        file_id = upload_response.json['file']['id']
        
        # Download the file
        response = self.client.get(f'/files/{file_id}', 
            headers=self.headers
        )
        
        assert response.status_code == 200
        assert response.data == b'test content'
    
    def test_download_file_not_found(self):
        """Test download of non-existent file."""
        response = self.client.get('/files/999', 
            headers=self.headers
        )
        
        assert response.status_code == 404
        assert 'File not found' in response.json['error']
    
    def test_download_file_unauthorized(self):
        """Test download of file by different user."""
        # Create another user
        other_user = User(
            email='other@example.com',
            username='otheruser',
            password_hash=generate_password_hash('otherpassword'),
            yearofbirth=1990,
            educational_level='Bachelor\'s Degree'
        )
        db.session.add(other_user)
        db.session.commit()
        
        # Upload file as test user
        test_file = io.BytesIO(b'test content')
        test_file.name = 'test.txt'
        
        upload_response = self.client.post('/files/upload', 
            data={'file': (test_file, 'test.txt')},
            headers=self.headers
        )
        
        file_id = upload_response.json['file']['id']
        
        # Get token for other user
        other_response = self.client.post('/auth/login', json={
            'email': 'other@example.com',
            'password': 'otherpassword'
        })
        other_token = other_response.json['data']['access_token']
        other_headers = {'Authorization': f'Bearer {other_token}'}
        
        # Try to download file as other user
        response = self.client.get(f'/files/{file_id}', 
            headers=other_headers
        )
        
        assert response.status_code == 404
        assert 'File not found' in response.json['error']
    
    def test_delete_file_success(self):
        """Test successful file deletion."""
        # First upload a file
        test_file = io.BytesIO(b'test content')
        test_file.name = 'test.txt'
        
        upload_response = self.client.post('/files/upload', 
            data={'file': (test_file, 'test.txt')},
            headers=self.headers
        )
        
        file_id = upload_response.json['file']['id']
        
        # Delete the file
        response = self.client.delete(f'/files/{file_id}', 
            headers=self.headers
        )
        
        assert response.status_code == 200
        assert 'deleted successfully' in response.json['message']
        
        # Verify file is deleted from database
        assert UploadedFile.query.get(file_id) is None
    
    def test_list_files(self):
        """Test file listing."""
        # Upload multiple files
        for i in range(3):
            test_file = io.BytesIO(f'test content {i}'.encode())
            test_file.name = f'test_{i}.txt'
            
            self.client.post('/files/upload', 
                data={'file': (test_file, f'test_{i}.txt')},
                headers=self.headers
            )
        
        # List files
        response = self.client.get('/files/', 
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json
        assert len(data['files']) == 3
        assert data['total'] == 3
    
    def test_list_files_with_pagination(self):
        """Test file listing with pagination."""
        # Upload multiple files
        for i in range(5):
            test_file = io.BytesIO(f'test content {i}'.encode())
            test_file.name = f'test_{i}.txt'
            
            self.client.post('/files/upload', 
                data={'file': (test_file, f'test_{i}.txt')},
                headers=self.headers
            )
        
        # List files with pagination
        response = self.client.get('/files/?page=1&per_page=2', 
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json
        assert len(data['files']) == 2
        assert data['total'] == 5
        assert data['page'] == 1
        assert data['per_page'] == 2
        assert data['has_next'] == True
        assert data['has_prev'] == False
    
    def test_upload_chat_file(self):
        """Test chat file upload."""
        test_file = io.BytesIO(b'chat file content')
        test_file.name = 'chat_doc.pdf'
        
        response = self.client.post('/files/chat/upload', 
            data={'file': (test_file, 'chat_doc.pdf')},
            headers=self.headers
        )
        
        assert response.status_code == 201
        data = response.json
        assert 'message' in data
        assert 'file' in data
        assert data['file']['filename'] == 'chat_doc.pdf'
    
    def test_get_file_info(self):
        """Test getting file metadata."""
        # First upload a file
        test_file = io.BytesIO(b'test content')
        test_file.name = 'test.txt'
        
        upload_response = self.client.post('/files/upload', 
            data={'file': (test_file, 'test.txt')},
            headers=self.headers
        )
        
        file_id = upload_response.json['file']['id']
        
        # Get file info
        response = self.client.get(f'/files/info/{file_id}', 
            headers=self.headers
        )
        
        assert response.status_code == 200
        data = response.json
        assert 'file' in data
        assert data['file']['id'] == file_id
        assert data['file']['original_filename'] == 'test.txt'
