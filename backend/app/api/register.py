from flask import Flask

def register_blueprints(app: Flask):
    """
    Registers all blueprints for the Flask application.
    """
    from app.api.auth.routes import auth_bp
    from app.api.checklists.routes import checklists_bp
    from app.api.files.routes import files_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(checklists_bp)
    app.register_blueprint(files_bp)
