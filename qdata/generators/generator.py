import importlib
from datetime import datetime, timezone

from pathlib import Path
from pprint import pprint
from typing import Union
from jinja2 import Template, Environment, FileSystemLoader
import tomllib as toml

from qdata import SCHEMASDIR, MODULESDIR, TEMPLATESDIR
from qdata import modules

def create_timestamp():
    timestamp = datetime.now(timezone.utc).astimezone().isoformat()
    return timestamp


def parser(path: Union[Path, str]):
    with open(path, 'rb') as f:
        data = toml.load(f)

    class_name = data['annotations']['name']
    inherits_from = data['annotations']['inherits_from']

    imports = {}
    params = {}

    # For now we should only pass a single string for inheritance
    if isinstance(inherits_from, list):
        inh = ''
        for i in inherits_from:
            inh = inh + i + ', '
        inherits_from = inh

    definition = data['definitions']
    defaults = data['defaults']

    if 'imports' in data:
        imports.update(data['imports'])
    if inherits_from != 'object':
        imports.update({inherits_from: f"from qdata.modules.{inherits_from.lower()} import {inherits_from}"})

    if 'params' in data:
        params = data['params']

    for key, val in defaults.items():
        if val == '':
            defaults[key] = "''"

    ret = dict(class_name=class_name,
               inherits_from=inherits_from,
               imports=imports,
               definition=definition,
               defaults=defaults,
               params=params,)

    return ret


def generate_class(config_path: Union[str, Path],
                   template_path: Union[str, Path] = TEMPLATESDIR.joinpath("entity.jinja")):

    with open(template_path, 'r') as f:
        template_content = f.read()

    template = Template(template_content)

    vals_dict = parser(config_path)
    output = template.render(vals_dict)

    with open(str(MODULESDIR.joinpath(f'{vals_dict["class_name"]}.py'.lower())), 'w') as f:
        f.write(output)

# TODO: Have error catching this for when there are more than a single item
def read_from_TOML(path: Union[str, Path]):
    with open(str(path), 'rb') as f:
        data = toml.load(f)

    name = [key for key in data.keys()][0]

    data = data[name]

    module = importlib.import_module(f'qdata.modules.{data["type"].lower()}')
    _class = getattr(module, data.pop('type'))

    ins = _class(**data)
    return ins


def generate_all_classes():
    for f in SCHEMASDIR.glob('*.toml'):
        if 'hierarchy.toml' in f.name:
            continue

        generate_class(f)


def delete_all_modules():
    for f in MODULESDIR.glob('*.py'):
        if '__init__.py' in f.name:
            continue
        f.unlink()
