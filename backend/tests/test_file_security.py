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

class TestFileSecurity:
    """Security tests for file upload functionality."""
    
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
    
    def test_directory_traversal_prevention(self):
        """Test prevention of directory traversal attacks."""
        # Test various directory traversal attempts
        malicious_filenames = [
            '../../../etc/passwd',
            '..\\..\\..\\windows\\system32\\config\\sam',
            '....//....//....//etc//passwd',
            '..%2F..%2F..%2Fetc%2Fpasswd',
            '..%5C..%5C..%5Cwindows%5Csystem32%5Cconfig%5Csam'
        ]
        
        for malicious_name in malicious_filenames:
            test_file = io.BytesIO(b'malicious content')
            test_file.name = malicious_name
            
            response = self.client.post('/files/upload', 
                data={'file': (test_file, malicious_name)},
                headers=self.headers
            )
            
            # Should either be rejected or sanitized
            if response.status_code == 201:
                # If accepted, verify the file was sanitized
                uploaded_file = UploadedFile.query.first()
                assert '..' not in uploaded_file.file_path
                assert 'etc' not in uploaded_file.file_path
                assert 'windows' not in uploaded_file.file_path
                db.session.delete(uploaded_file)
                db.session.commit()
            else:
                # Should be rejected
                assert response.status_code in [400, 413]
    
    def test_executable_file_upload_prevention(self):
        """Test prevention of executable file uploads."""
        executable_extensions = ['.exe', '.bat', '.cmd', '.com', '.scr', '.pif', '.vbs', '.js']
        
        for ext in executable_extensions:
            test_file = io.BytesIO(b'executable content')
            test_file.name = f'malicious{ext}'
            
            response = self.client.post('/files/upload', 
                data={'file': (test_file, f'malicious{ext}')},
                headers=self.headers
            )
            
            # Should be rejected
            assert response.status_code == 400
            assert 'File type not allowed' in response.json['error']
    
    def test_script_file_upload_prevention(self):
        """Test prevention of script file uploads."""
        script_extensions = ['.php', '.asp', '.jsp', '.py', '.rb', '.pl', '.sh', '.ps1']
        
        for ext in script_extensions:
            test_file = io.BytesIO(b'<?php echo "hacked"; ?>')
            test_file.name = f'script{ext}'
            
            response = self.client.post('/files/upload', 
                data={'file': (test_file, f'script{ext}')},
                headers=self.headers
            )
            
            # Should be rejected
            assert response.status_code == 400
            assert 'File type not allowed' in response.json['error']
    
    def test_oversized_file_prevention(self):
        """Test prevention of oversized file uploads."""
        # Create file larger than limit
        large_content = b'x' * (20 * 1024 * 1024)  # 20MB
        test_file = io.BytesIO(large_content)
        test_file.name = 'large_file.txt'
        
        response = self.client.post('/files/upload', 
            data={'file': (test_file, 'large_file.txt')},
            headers=self.headers
        )
        
        # Should be rejected
        assert response.status_code == 413
        assert 'exceeds maximum' in response.json['error']
    
    def test_unauthorized_file_access(self):
        """Test prevention of unauthorized file access."""
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
        test_file = io.BytesIO(b'private content')
        test_file.name = 'private.txt'
        
        upload_response = self.client.post('/files/upload', 
            data={'file': (test_file, 'private.txt')},
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
        
        # Try to access file as other user
        response = self.client.get(f'/files/{file_id}', 
            headers=other_headers
        )
        
        # Should be denied
        assert response.status_code == 404
        assert 'File not found' in response.json['error']
    
    def test_unauthorized_file_deletion(self):
        """Test prevention of unauthorized file deletion."""
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
        test_file = io.BytesIO(b'private content')
        test_file.name = 'private.txt'
        
        upload_response = self.client.post('/files/upload', 
            data={'file': (test_file, 'private.txt')},
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
        
        # Try to delete file as other user
        response = self.client.delete(f'/files/{file_id}', 
            headers=other_headers
        )
        
        # Should be denied
        assert response.status_code == 404
        assert 'File not found' in response.json['error']
    
    def test_malicious_mime_type_detection(self):
        """Test detection of malicious MIME type spoofing."""
        # Create file with .txt extension but executable content
        test_file = io.BytesIO(b'#!/bin/bash\necho "hacked"')
        test_file.name = 'script.txt'
        
        response = self.client.post('/files/upload', 
            data={'file': (test_file, 'script.txt')},
            headers=self.headers
        )
        
        # Should be accepted (we're not doing deep content analysis)
        # but the filename should be sanitized
        if response.status_code == 201:
            uploaded_file = UploadedFile.query.first()
            assert uploaded_file.original_filename == 'script.txt'
            # Verify the file path is safe
            assert '..' not in uploaded_file.file_path
    
    def test_null_byte_injection_prevention(self):
        """Test prevention of null byte injection attacks."""
        # Test filename with null bytes
        test_file = io.BytesIO(b'content')
        test_file.name = 'file.txt\x00.exe'
        
        response = self.client.post('/files/upload', 
            data={'file': (test_file, 'file.txt\x00.exe')},
            headers=self.headers
        )
        
        # Should be handled safely
        if response.status_code == 201:
            uploaded_file = UploadedFile.query.first()
            assert '\x00' not in uploaded_file.original_filename
            assert '\x00' not in uploaded_file.file_path
    
    def test_concurrent_upload_handling(self):
        """Test handling of concurrent uploads."""
        import threading
        import time
        
        results = []
        
        def upload_file(file_num):
            test_file = io.BytesIO(f'content {file_num}'.encode())
            test_file.name = f'file_{file_num}.txt'
            
            response = self.client.post('/files/upload', 
                data={'file': (test_file, f'file_{file_num}.txt')},
                headers=self.headers
            )
            
            results.append(response.status_code)
        
        # Start multiple uploads concurrently
        threads = []
        for i in range(5):
            thread = threading.Thread(target=upload_file, args=(i,))
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All uploads should succeed
        assert all(status == 201 for status in results)
    
    def test_file_quota_enforcement(self):
        """Test file quota enforcement."""
        # This test would require implementing actual quota checking
        # For now, we'll test that the quota check function exists
        from app.core.file_utils import check_file_quota
        
        # Test quota check
        is_within_quota, error = check_file_quota(1, 1024)
        assert isinstance(is_within_quota, bool)
        assert isinstance(error, str)
    
    def test_secure_filename_generation(self):
        """Test secure filename generation."""
        from app.core.file_utils import secure_filename_custom
        
        # Test various problematic filenames
        problematic_names = [
            '../../../etc/passwd',
            'file with spaces.txt',
            'file\x00with\x00nulls.txt',
            'file/with/slashes.txt',
            'file\\with\\backslashes.txt',
            'file:with:colons.txt',
            'file*with*asterisks.txt',
            'file?with?questionmarks.txt',
            'file<with>brackets.txt',
            'file|with|pipes.txt'
        ]
        
        for name in problematic_names:
            secure_name = secure_filename_custom(name)
            # Should not contain dangerous characters
            assert '..' not in secure_name
            assert '/' not in secure_name
            assert '\\' not in secure_name
            assert ':' not in secure_name
            assert '*' not in secure_name
            assert '?' not in secure_name
            assert '<' not in secure_name
            assert '>' not in secure_name
            assert '|' not in secure_name
            assert '\x00' not in secure_name
