from flask import Flask
from flask_cors import CORS
from app.routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.register_blueprint(auth_bp)
    return app
