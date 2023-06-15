from pathlib import Path
from pprint import pprint
from typing import Union
from jinja2 import Template, Environment, FileSystemLoader
import tomllib as toml

from qdata import SCHEMASDIR, MODULESDIR, TEMPLATESDIR


def parser(path: Union[Path, str]):
    with open(path, 'rb') as f:
        data = toml.load(f)

    print(f'==================== incoming TOML ====================')
    pprint(data)
    print('++++++++++++++++++++ incoming TOML ++++++++++++++++++++')

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

    definition = data['definition']
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
    print(f'==================== outgoing Dictionary ====================')
    pprint(ret)
    print('++++++++++++++++++++ outgoing Dictionary ++++++++++++++++++++')
    return ret


def generate_class(config_path: Union[str, Path],
                   template_path: Union[str, Path] = TEMPLATESDIR.joinpath("entity.jinja")):


    with open(template_path, 'r') as f:
        template_content = f.read()

    template = Template(template_content)

    vals_dict = parser(config_path)
    output = template.render(vals_dict)

    print(f'\n\n==================== output ====================')
    print(output)

    with open(str(MODULESDIR.joinpath(f'{vals_dict["class_name"]}.py'.lower())), 'w') as f:
        print(f'about to save the module in: {f.name}')

        f.write(output)


    print('++++++++++++++++++++ output ++++++++++++++++++++')


