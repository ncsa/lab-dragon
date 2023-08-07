
import connexion


app = connexion.App(__name__, specification_dir='./')
app.add_api('API_specification.yaml')

if __name__ == '__main__':
    app.run(host='localhost', port=8000, debug=True)

