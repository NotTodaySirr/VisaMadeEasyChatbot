#!/usr/bin/env python3
"""
Simple script to test database configuration
"""
import os
import sys

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app

def test_database_config():
    """Test that database configuration works correctly."""
    
    print("Testing database configuration...")
    
    # Test 1: Default testing config (should use PostgreSQL)
    print("\n1. Testing default 'testing' config:")
    app = create_app('testing')
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Test 2: With environment variable set (should use SQLite)
    print("\n2. Testing with TEST_DATABASE_URL environment variable:")
    os.environ['TEST_DATABASE_URL'] = 'sqlite:///:memory:'
    app = create_app('testing')
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Clean up
    if 'TEST_DATABASE_URL' in os.environ:
        del os.environ['TEST_DATABASE_URL']
    
    print("\nTest completed!")

if __name__ == '__main__':
    test_database_config()