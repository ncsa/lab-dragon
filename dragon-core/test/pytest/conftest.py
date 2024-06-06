import os
import sys
from pathlib import Path

import pytest
import connexion

import dragon_core
from dragon_core.scripts.env_creator import create_test_env_with_msmts
from dragon_core.generators.meta import generate_all_classes, delete_all_modules


def count_files(path):
    path = Path(path)

    if path.is_dir():
        return len([x for x in path.glob('*') if '.DS_Store' not in str(x) or '__pycache__' not in str(x)])


@pytest.fixture()
def refresh_modules():
    delete_all_modules()
    generate_all_classes()

@pytest.fixture()
def module_names(refresh_modules):

    nschemas = count_files(dragon_core.SCHEMASDIR)
    nmodules = count_files(dragon_core.MODULESDIR)

    if nmodules != nschemas:
        raise FileNotFoundError(f'Number of schemas ({nschemas}) does not match number of modules ({nmodules})')

    return [x.stem for x in dragon_core.MODULESDIR.glob('*.py') if '__init__' not in str(x)]


@pytest.fixture()
def generate_msmt_folder_structure(request, tmp_path=Path(r'./tmp').resolve(), n_measurements=1, generate_each_run=False):
    create_test_env_with_msmts(request, tmp_path, n_measurements, generate_each_run)


# -- Testing the server -- #

def set_cors_headers_on_response(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response


@pytest.fixture(scope='module')
def client():
    original_path = os.getcwd() #+ '/test/pytest'
    entities_path = Path("../../dragon_core/api").resolve()

    sys.path.insert(0, str(entities_path))

    os.chdir(entities_path)

    app = connexion.App(__name__, specification_dir='../../dragon_core/api/')
    app.add_api(Path("../../dragon_core/api/API_specification.yaml"))
    app.app.after_request(set_cors_headers_on_response)
    with app.app.test_client() as c:
        os.chdir(original_path)
        yield c
