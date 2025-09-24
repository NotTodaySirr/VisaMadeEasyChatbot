import os
from datetime import timedelta

class Config:
    """Base configuration with default settings."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    

    # Session Configuration
    SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    
    # CORS Configuration
    CORS_ORIGINS = ['http://localhost:5173']  # React dev server
    
    # File Upload Configuration
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    ALLOWED_EXTENSIONS = {
        'images': {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'},
        'documents': {'pdf', 'doc', 'docx', 'txt', 'rtf'},
        'archives': {'zip', 'rar', '7z', 'tar', 'gz'},
        'spreadsheets': {'xls', 'xlsx', 'csv'},
        'presentations': {'ppt', 'pptx'},
        'videos': {'mp4', 'avi', 'mov', 'wmv', 'flv'},
        'audio': {'mp3', 'wav', 'flac', 'aac', 'ogg'}
    }
    CHAT_FILE_LIMITS = {
        'max_size': 10 * 1024 * 1024,  # 10MB for chat files
        'allowed_types': ['images', 'documents', 'spreadsheets', 'presentations']
    }
    
    # Redis Configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # Celery Configuration
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL') or 'redis://localhost:6379/0'
    CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND') or 'redis://localhost:6379/0'
    
    # AI Configuration
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    AI_MODEL = os.environ.get('AI_MODEL') or 'gemini-1.5-flash'
    
    # Stream Configuration
    STREAM_TIMEOUT = 300  # 5 minutes
    STREAM_HEALTH_TTL = 60  # 1 minute

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('DEV_DATABASE_URL') or \
        'postgresql://postgres:password@localhost/visamadeeasy_dev'
    
class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get('TEST_DATABASE_URL') or \
        'sqlite:///:memory:'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)  # Short expiry for testing
    
class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://postgres:password@localhost/visamadeeasy_prod'
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}