from api import app
from flask import render_template



@app.route('/api/response')
def response():
    return {'response': app.config['RESPONSE']}

@app.route('/index')
def index():
    user = {'username': 'Dmytro'}
    return render_template('index.html', title='Home', user=user)


