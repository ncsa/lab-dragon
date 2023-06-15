from pathlib import Path
from pprint import pprint
from typing import Union
from jinja2 import Template, Environment, FileSystemLoader
import tomllib as toml

SCHEMASDIR = Path('../../schemas')  # This should be a configuration option

MODULESDIR = Path('../modules')

def parser(path: Union[Path, str]):
    with open(path, 'rb') as f:
        data = toml.load(f)

    print(f'==================== incoming TOML ====================')
    pprint(data)
    print('++++++++++++++++++++ incoming TOML ++++++++++++++++++++')

    class_name = data['annotations']['name']
    inherits_from = data['annotations']['inherits_from']

    imports = {}
    definition = {}
    defaults = {}
    params = {}

    # For now we should only pass a single string for inheritance
    if isinstance(inherits_from, list):
        inh = ''
        for i in inherits_from:
            inh = inh + i + ', '
        inherits_from = inh

    if inherits_from != 'object':
        parent_path = SCHEMASDIR.joinpath(f'{inherits_from}.toml')
        if not parent_path.is_file():
            raise FileNotFoundError(f'Parent class {inherits_from} not found in {SCHEMASDIR}')
        parent_vals = parser(parent_path)
        imports.update(parent_vals['imports'])
        definition.update(parent_vals['definition'])
        defaults.update(parent_vals['defaults'])
        params.update(parent_vals['params'])

        imports[inherits_from] = f"from modules import {inherits_from.lower()}"

    definition.update(data['definition'])
    defaults.update(data['defaults'])

    if 'imports' in data:
        imports.update(data['imports'])

    if 'params' in data:
        params.update(data['params'])

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


if __name__ == '__main__':

    config_path = Path('../../schemas/entity.toml')
    template_file = Path('../../templates/entity.jinja')

    with open(template_file, 'r') as f:
        template_content = f.read()

    template = Template(template_content)

    vals_dict = parser(config_path)
    output = template.render(vals_dict)

    print(f'\n\n==================== output ====================')
    print(output)

    with open(str(MODULESDIR.joinpath(f'{vals_dict["class_name"]}.py')), 'w') as f:
        f.write(output)


    print('++++++++++++++++++++ output ++++++++++++++++++++')

