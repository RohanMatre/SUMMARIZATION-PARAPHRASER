from flask import Flask
from flask_cors import CORS
from blueprints import main_blueprint

app = Flask(__name__)
# Apply CORS to the whole app, and allow credentials
CORS(app, resources={r"/*": {"origins": "http://localhost:3000", "supports_credentials": True}})

app.register_blueprint(main_blueprint)

if __name__ == '_main_':
    app.run()