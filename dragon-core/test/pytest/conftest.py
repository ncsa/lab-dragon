import os
import sys
from pathlib import Path

import pytest
import connexion

import dragon_core
from dragon_core.config import verify_and_parse_config
from dragon_core.scripts.new_env_creator import create_simulated_env
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
def deprecated_generate_msmt_folder_structure(request, tmp_path=Path(r'./tmp').resolve(), n_measurements=1, generate_each_run=False):
    create_test_env_with_msmts(request, tmp_path, n_measurements, generate_each_run)


# -- Testing the server -- #

def set_cors_headers_on_response(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Headers'] = '*'
    response.headers['Access-Control-Allow-Methods'] = '*'
    return response


@pytest.fixture(scope='module')
def client():
    """
    client fixture starts a testing server, this should look very similar to how the real server is started.
    """
    entities_path = Path("../../dragon_core/api").resolve()

    sys.path.insert(0, str(entities_path))
    tmp_path = Path("./tmp").resolve()

    config_path = Path('../../config_example.toml').resolve()
    config = verify_and_parse_config(config_path)

    config['notebook_root'] = create_simulated_env(target=tmp_path)

    app = connexion.FlaskApp(__name__, specification_dir='../../dragon_core/api/')
    app.add_api(Path("../../dragon_core/api/API_specification.yaml"))
    app.app.after_request(set_cors_headers_on_response)
    with app.app.app_context():
        app.app.config['API_config'] = config
        with app.test_client() as c:
            yield c


@pytest.fixture()
def toml_files():
    current_path = Path(__file__).resolve()
    toml_files = [x for x in (current_path.parent / 'tmp').glob('*.toml')]

    return toml_files
