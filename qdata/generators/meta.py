import importlib
from pathlib import Path
from typing import Union
from datetime import datetime, timezone

import tomllib as toml
from jinja2 import Environment, FileSystemLoader

from qdata import modules
from qdata import SCHEMASDIR, MODULESDIR, TEMPLATESDIR, APISCHEMAS


def create_timestamp() -> str:
    """
    Creates a timestamp in ISO 8601 format.

    :return: Timestamp in ISO 8601 format.
    """
    timestamp = datetime.now(timezone.utc).astimezone().isoformat()
    return timestamp


def parser(path: Union[Path, str]) -> dict:
    """
    Parses a TOML file and returns a dictionary of the contents necessary to create a class based on the entity.jinja
    template.

    :param path: The path to the TOML file to be parsed.
    :return: Dictionary in which keys are the values that need the jinja template needs.
    """
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


# TODO: If we keep the jinja way of generating code, we need to be able to select custom parsers
def generate_class(config_path: Union[str, Path],
                   module_template_path: Union[str, Path] = TEMPLATESDIR.joinpath("entity.jinja"),
                   schema_template_path: Union[str, Path] = TEMPLATESDIR.joinpath("openAPI_schema.jinja")
                   ) -> None:
    """
    Generates a class and openAPI schema using a Jinja module_template based on the TOML file provided.

    :param config_path: Path to the TOML config file.
    :param module_template_path: Path to the jinja module_template file.
    :param schema_template_path: Path to the jinja file for openAPI schemas.
    """
    with open(module_template_path, 'r') as f:
        module_template_content = f.read()

    with open(schema_template_path, 'r') as f:
        schema_template_content = f.read()

    env = Environment(loader=FileSystemLoader(TEMPLATESDIR), extensions=['jinja2.ext.do'], )

    # TODO: Fix so that this is not an issue
    # Module template was written before I knew of the lstrip_blocks and trim_blocks options
    module_template = env.get_template(module_template_path.name)

    env.lstrip_blocks = True
    env.trim_blocks = True
    # Schema template needs to have whitespace removed
    schema_template = env.get_template(schema_template_path.name)

    vals_dict = parser(config_path)
    module_output = module_template.render(vals_dict)
    schema_output = schema_template.render(vals_dict)

    with open(str(MODULESDIR.joinpath(f'{vals_dict["class_name"]}.py'.lower())), 'w') as f:
        f.write(module_output)

    with open(str(APISCHEMAS.joinpath(f'{vals_dict["class_name"]}.yml'.lower())), 'w') as f:
        f.write(schema_output)


# TODO: Have error catching this for when there are more than a single item
def read_from_TOML(path: Union[str, Path]) -> object:
    """
    Reads a TOML file and returns an instantiated object of the class specified in the file.

    :param path: The path to the TOML file.
    :return: An instantiated object of the class specified in the TOML file.
    """
    with open(str(path), 'rb') as f:
        data = toml.load(f)

    data = data[next(iter(data))]

    module = importlib.import_module(f'qdata.modules.{data["type"].lower()}')
    _class = getattr(module, data.pop('type'))

    ins = _class(**data)
    return ins


def generate_all_classes() -> None:
    """
    Helper class to create all the classes in the schemas directory.
    """
    for f in SCHEMASDIR.glob('*.toml'):
        if 'hierarchy.toml' in f.name:
            continue
        generate_class(f)


def delete_all_modules() -> None:
    """
     Helper class to delete all modules in the modules directory.
    """
    for f in MODULESDIR.glob('*.py'):
        if '__init__.py' in f.name:
            continue
        f.unlink()

    for f in SCHEMASDIR.glob('*.yml'):
        f.unlink()
