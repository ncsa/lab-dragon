import importlib
import time
from pathlib import Path

import tomllib as toml

import qdata
import qdata.modules
from qdata.generators.generator import generate_all_classes


def count_files(path):
    path = Path(path)

    if path.is_dir():
        return len([x for x in path.glob('*') if '.DS_Store' not in str(x) or '__pycache__' not in str(x)])


def test_fields_in_generated_class():

    nschemas = count_files(qdata.SCHEMASDIR)
    nmodules = count_files(qdata.MODULESDIR)

    if nmodules != nschemas:
        raise FileNotFoundError(f'Number of schemas ({nschemas}) does not match number of modules ({nmodules})')

    classes = [x.stem for x in qdata.MODULESDIR.glob('*.py') if '__init__' not in str(x)]
    for cls in classes:

        toml_path = qdata.SCHEMASDIR.joinpath(f'{cls}.toml')

        with open(str(toml_path), 'rb') as f:
            toml_doc = toml.load(f)

        module = importlib.import_module(f'qdata.modules.{cls}')
        cls = cls[0].upper() + cls[1:]
        _class = getattr(module, cls)

        instance = _class()
        for field in toml_doc['definitions']:
            assert hasattr(instance, field)






