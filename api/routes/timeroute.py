import time
from api import app

@app.route('/api/time')
def get_current_time():
    return {'time': time.time()}