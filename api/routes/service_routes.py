from forms.responseform import ResponseForm
from api import app
from flask import Flask, request, jsonify, make_response
import requests

def proxy_request(service_url, subpath):
    # Use the original headers but override 'Content-Type' if it is not set to 'application/json'
    headers = {key: value for key, value in request.headers if key.lower() != 'host'}
    # Default Content-Type to 'application/json' if not specified
    if 'content-type' not in headers or headers['content-type'] == 'text/plain':
        headers['content-type'] = 'application/json'

    response = requests.request(
        method=request.method,
        url=f"{service_url}/{subpath}",
        data=request.get_data(),  # Use get_data() to forward all types of bodies, not just JSON
        headers=headers
    )
    return make_response(response.content, response.status_code)

def make_response_from_proxy(response):
    resp = make_response(response.content, response.status_code)
    for key, value in response.headers.items():
        resp.headers[key] = value
    return resp

@app.route('/groove2groove/<path:subpath>', methods=['GET', 'POST'])
def groove2groove(subpath):
    return proxy_request('http://groove2groove_service:5000', subpath)

@app.route('/omnizart/<path:subpath>', methods=['GET', 'POST'])
def omnizart(subpath):
    return proxy_request('http://omnizart_service:5000', subpath)

@app.route('/rvc/<path:subpath>', methods=['GET', 'POST'])
def rvc(subpath):
    return proxy_request('http://rvc_service:5000', subpath)

@app.route('/spleeter/<path:subpath>', methods=['GET', 'POST'])
def spleeter(subpath):
    return proxy_request('http://spleeter_service:5000', subpath)  # Note: Port corrected to 5000
