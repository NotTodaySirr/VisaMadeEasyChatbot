import os
from dotenv import load_dotenv
from app import create_app
from app.core.extensions import db

# Load environment variables
load_dotenv()

# Create Flask application
app = create_app(os.getenv('FLASK_CONFIG', 'development'))

@app.cli.command()
def init_db():
    """Initialize the database."""
    db.create_all()
    print('Database initialized!')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)