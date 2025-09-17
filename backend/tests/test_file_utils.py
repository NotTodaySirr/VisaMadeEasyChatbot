import pytest
import os
import tempfile
import shutil
from unittest.mock import patch, MagicMock
from flask import Flask
from app.core.file_utils import (
    allowed_file,
    secure_filename_custom,
    get_upload_path,
    ensure_upload_directory,
    get_file_size,
    get_mime_type,
    delete_file,
    validate_file_size,
    is_safe_file
)

class TestFileUtils:
    """Test cases for file utility functions."""
    
    def setup_method(self):
        """Set up test environment."""
        self.temp_dir = tempfile.mkdtemp()
        self.test_file = os.path.join(self.temp_dir, 'test.txt')
        with open(self.test_file, 'w') as f:
            f.write('test content')
        
        # Create Flask app for testing
        self.app = Flask(__name__)
        self.app.config.update({
            'UPLOAD_FOLDER': self.temp_dir,
            'MAX_CONTENT_LENGTH': 16 * 1024 * 1024,
            'ALLOWED_EXTENSIONS': {
                'images': {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'},
                'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf'},
                'archives': {'zip', 'rar', '7z', 'tar', 'gz'},
                'spreadsheets': {'xls', 'xlsx', 'csv'},
                'presentations': {'ppt', 'pptx'},
                'videos': {'mp4', 'avi', 'mov', 'wmv', 'flv'},
                'audio': {'mp3', 'wav', 'flac', 'aac', 'ogg'}
            },
            'CHAT_FILE_LIMITS': {
                'max_size': 10 * 1024 * 1024,
                'allowed_types': ['images', 'documents', 'spreadsheets', 'presentations']
            }
        })
        self.app_context = self.app.app_context()
        self.app_context.push()
    
    def teardown_method(self):
        """Clean up test environment."""
        self.app_context.pop()
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def test_allowed_file_valid_extension(self):
        """Test allowed_file with valid file extension."""
        
        assert allowed_file('test.png', 'checklist') == True
        assert allowed_file('document.pdf', 'checklist') == True
        assert allowed_file('image.jpg', 'checklist') == True
    
    def test_allowed_file_invalid_extension(self):
        """Test allowed_file with invalid file extension."""
        
        assert allowed_file('test.exe', 'checklist') == False
        assert allowed_file('malicious.bat', 'checklist') == False
        assert allowed_file('', 'checklist') == False
    
    def test_allowed_file_chat_restrictions(self):
        """Test allowed_file with chat content type restrictions."""
        
        assert allowed_file('test.png', 'chat') == True
        assert allowed_file('document.pdf', 'chat') == True
        assert allowed_file('video.mp4', 'chat') == False
    
    def test_secure_filename_custom(self):
        """Test secure filename generation."""
        # Test normal filename
        result = secure_filename_custom('test_file.txt')
        assert result.endswith('_test_file.txt')
        assert len(result) > len('test_file.txt')
        
        # Test empty filename
        result = secure_filename_custom('')
        assert result is not None
        assert len(result) > 0
        
        # Test None filename
        result = secure_filename_custom(None)
        assert result is not None
        assert len(result) > 0
    
    def test_get_upload_path(self):
        """Test upload path generation."""
        
        # Test checklist with item_id
        path = get_upload_path(123, 'checklist', 456)
        assert path == os.path.join(self.temp_dir, 'checklist', '123', '456')
        
        # Test other content types
        path = get_upload_path(123, 'chat')
        assert path == os.path.join(self.temp_dir, 'chat', '123')
        
        path = get_upload_path(123, 'profile')
        assert path == os.path.join(self.temp_dir, 'profile', '123')
    
    def test_ensure_upload_directory(self):
        """Test directory creation."""
        test_path = os.path.join(self.temp_dir, 'new', 'directory', 'file.txt')
        
        # Directory should not exist initially
        assert not os.path.exists(os.path.dirname(test_path))
        
        # Create directory
        ensure_upload_directory(test_path)
        
        # Directory should exist now
        assert os.path.exists(os.path.dirname(test_path))
    
    def test_get_file_size(self):
        """Test file size retrieval."""
        # Test existing file
        size = get_file_size(self.test_file)
        assert size > 0
        
        # Test non-existent file
        size = get_file_size('non_existent_file.txt')
        assert size == 0
    
    def test_get_mime_type(self):
        """Test MIME type detection."""
        # Test common file types
        assert get_mime_type('test.txt') == 'text/plain'
        assert get_mime_type('image.png') == 'image/png'
        assert get_mime_type('document.pdf') == 'application/pdf'
        
        # Test unknown extension
        assert get_mime_type('unknown.xyz') == 'application/octet-stream'
    
    def test_delete_file(self):
        """Test file deletion."""
        # Test deleting existing file
        assert os.path.exists(self.test_file)
        result = delete_file(self.test_file)
        assert result == True
        assert not os.path.exists(self.test_file)
        
        # Test deleting non-existent file
        result = delete_file('non_existent_file.txt')
        assert result == False
    
    def test_validate_file_size(self):
        """Test file size validation."""
        # Update app config for this test
        self.app.config['MAX_CONTENT_LENGTH'] = 1024  # 1KB
        self.app.config['CHAT_FILE_LIMITS'] = {
            'max_size': 512  # 512 bytes for chat
        }
        
        # Test valid size for checklist
        is_valid, error = validate_file_size(500, 'checklist')
        assert is_valid == True
        assert error == ""
        
        # Test invalid size for checklist
        is_valid, error = validate_file_size(2000, 'checklist')
        assert is_valid == False
        assert "exceeds maximum" in error
        
        # Test valid size for chat
        is_valid, error = validate_file_size(400, 'chat')
        assert is_valid == True
        
        # Test invalid size for chat
        is_valid, error = validate_file_size(1000, 'chat')
        assert is_valid == False
    
    @patch('app.core.file_utils.current_app')
    def test_is_safe_file(self, mock_app):
        """Test file safety checks."""
        mock_app.config = {'UPLOAD_FOLDER': '/uploads'}
        
        # Test safe file path
        safe_path = '/uploads/checklist/123/file.txt'
        assert is_safe_file(safe_path) == True
        
        # Test unsafe file path (directory traversal)
        unsafe_path = '/uploads/../etc/passwd'
        assert is_safe_file(unsafe_path) == False
        
        # Test unsafe file path (outside upload folder)
        unsafe_path = '/etc/passwd'
        assert is_safe_file(unsafe_path) == False
        
        # Test relative path with dots
        unsafe_path = '../../../etc/passwd'
        assert is_safe_file(unsafe_path) == False
