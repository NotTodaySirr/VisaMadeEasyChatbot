"""Celery configuration for background tasks."""
from celery import Celery
from flask import Flask


def make_celery(app: Flask) -> Celery:
    """Create Celery instance for Flask app."""
    celery = Celery(
        app.import_name,
        backend=app.config['CELERY_RESULT_BACKEND'],
        broker=app.config['CELERY_BROKER_URL']
    )
    celery.conf.update(app.config)
    
    # Configure task retry settings
    celery.conf.update(
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',
        enable_utc=True,
        task_track_started=True,
        task_time_limit=300,  # 5 minutes
        task_soft_time_limit=240,  # 4 minutes
    )
    # Ensure tasks are discoverable in workers
    try:
        celery.conf.update(
            imports=(celery.conf.get('imports') or []) + ['app.tasks.ai', 'app.tasks.cleanup']
        )
    except Exception:
        pass
    try:
        celery.autodiscover_tasks(['app.tasks'])
    except Exception:
        pass
    
    return celery


# Global celery instance (will be initialized in app factory)
celery = None


def init_celery(app: Flask) -> Celery:
    """Initialize Celery with Flask app context."""
    global celery
    celery = make_celery(app)
    
    # Import tasks to register them
    from app.tasks import cleanup  # noqa: F401
    from app.tasks import ai  # noqa: F401
    
    return celery


# Create a default Celery app for workers (when Flask app isn't available)
def get_celery_app():
    """Get or create Celery app instance."""
    global celery
    if celery is None:
        # Create a minimal Celery app for workers
        import os
        celery = Celery(
            'visamadeeasy',
            backend=os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/0'),
            broker=os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/0')
        )
        celery.conf.update(
            task_serializer='json',
            accept_content=['json'],
            result_serializer='json',
            timezone='UTC',
            enable_utc=True,
            task_track_started=True,
            task_time_limit=300,
            task_soft_time_limit=240,
        )
        
        # Import tasks to register them
        from app.tasks import cleanup  # noqa: F401
        from app.tasks import ai  # noqa: F401
        try:
            celery.autodiscover_tasks(['app.tasks'])
        except Exception:
            pass
    
    return celery


# Export the Celery app for workers
celery = get_celery_app()