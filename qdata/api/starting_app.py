
import connexion

def set_cors_headers_on_response(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response


app = connexion.App(__name__, specification_dir='./')
app.add_api('API_specification.yaml')
app.app.after_request(set_cors_headers_on_response)


# TODO: Add a call on the api for the client to know what are the supported media types.
#  This might not be necessary since the client should probably have specific code on how it handles different media
#  types.

if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)

