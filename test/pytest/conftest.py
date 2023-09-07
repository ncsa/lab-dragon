from pathlib import Path

import pytest

import qdata
from qdata.generators.meta import generate_all_classes, delete_all_modules


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

    nschemas = count_files(qdata.SCHEMASDIR)
    nmodules = count_files(qdata.MODULESDIR)

    if nmodules != nschemas:
        raise FileNotFoundError(f'Number of schemas ({nschemas}) does not match number of modules ({nmodules})')

    return [x.stem for x in qdata.MODULESDIR.glob('*.py') if '__init__' not in str(x)]