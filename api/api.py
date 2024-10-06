from flask import Flask
from config import Config

app = Flask(__name__)
app.config.from_object(Config)

from routes.service_routes import groove2groove, omnizart, rvc, spleeter

