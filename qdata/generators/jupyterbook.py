"""
From the root path is what all the general information for the book is going to get gathered.
"""

from typing import Union, Optional
from pathlib import Path
from pprint import pprint

import tomllib as toml

from qdata import QDATADIR
from qdata.generators.display import generate_md


# FIXME: Right now we are generating the md files twice, we should figure out a way of doing it only once.
def _generate_children_dict(source: Path, target: Path) -> Optional[dict]:

    with open(source, 'rb') as f:
        data = toml.load(f)

    data = data[next(iter(data))]

    # md_path = generate_md(source, target)

    children = data['children']

    if len(children) == 0:
        return None

    child_dict = {}.copy()
    for child in children:
        child_md = generate_md(child, target)
        child_ret = _generate_children_dict(child, target)
        child_dict[child_md] = child_ret

    # growing_dict[md_path] = {child: generate_children_dict(child, target, growing_dict) for child in children}

    return child_dict


def create_relation_dict(source: Path, target: Path) -> dict:
    root_path_md = generate_md(source, target)

    child_dict = _generate_children_dict(source, target)
    files_dict = {root_path_md: child_dict}
    return files_dict


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
        logo_path = QDATADIR.joinpath('qdata', 'resource', 'qubit_logo.png')

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

    files_dict = create_relation_dict(root_path, target_path)

    pprint(files_dict)






