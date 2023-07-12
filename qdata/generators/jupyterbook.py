"""
From the root path is what all the general information for the book is going to get gathered.
"""

from typing import Union, Optional
from pathlib import Path

import tomllib as toml
from jinja2 import Environment, FileSystemLoader

from qdata import QDATADIR, TEMPLATESDIR
from qdata.generators.display import generate_md


# FIXME: Right now we are generating the md files twice, we should figure out a way of doing it only once.
def _generate_children_dict(root_path: Path, target: Path, indent) -> Optional[Union[dict, tuple]]:

    with open(root_path, 'rb') as f:
        data = toml.load(f)

    current_indent = indent+1
    data = data[next(iter(data))]

    children = data['children']

    if len(children) == 0:
        return None

    child_dict = {}.copy()
    for child in children:
        child_md = generate_md(child, target)
        child_ret = _generate_children_dict(child, target, current_indent)
        child_dict[(child_md.stem, current_indent)] = child_ret

    return child_dict


def create_relation_dict(root_path: Path, target: Path) -> dict:
    root_path_md = generate_md(root_path, target)

    child_dict = _generate_children_dict(root_path, target, indent=0)
    return child_dict


def generate_book(root_path: Union[Path, str],
                  target_path: Union[Path, str],
                  logo_path: Optional[Union[Path, str]] = None,):
    """
    Creates a notebook from the root TOML file.

    :param target_path:
    :param logo_path:
    :param root_path:
    :return:
    """

    if logo_path is None:
        logo_path = QDATADIR.joinpath('resource', 'qubit_logo.png')

    root_path = Path(root_path)

    if not target_path.is_dir():
        raise ValueError(f"Path {target_path} is not a directory.")

    if not target_path.exists():
        target_path.mkdir(exist_ok=True)

    if not root_path.exists():
        raise ValueError(f"Path {root_path} does not exist.")

    with open(root_path, 'rb') as f:
        data = toml.load(f)

    data = data[next(iter(data))]

    config_dict = dict(tittle=data['name'], author=data['user'], logo_path=logo_path)
    chapters = create_relation_dict(root_path, target_path)

    env = Environment(loader=FileSystemLoader(TEMPLATESDIR.joinpath('jupyterbook')))

    conf_template = env.get_template('_config.jinja')
    toc_template = env.get_template('_toc.jinja')

    conf_output = conf_template.render(config_dict)
    toc_output = toc_template.render(root=root_path.stem, chapters=chapters)

    with open(target_path.joinpath('_config.yml'), 'w') as f:
        f.write(conf_output)

    with open(target_path.joinpath('_toc.yml'), 'w') as f:
        f.write(toc_output)


