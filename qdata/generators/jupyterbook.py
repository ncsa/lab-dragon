"""
From the root path is what all the general information for the book is going to get gathered.
"""
from pathlib import Path
from subprocess import call
from typing import Union, Optional

import tomllib as toml
from jinja2 import Environment, FileSystemLoader

from qdata import QDATADIR, TEMPLATESDIR
from qdata.generators.display import generate_md


# FIXME: Right now we are generating the md files twice, we should figure out a way of doing it only once.
def _generate_children_dict(root_path: Path, target: Path, indent: int, resource_path: Optional[Path] = None)\
        -> Optional[Union[dict, tuple]]:
    """
    Helper recursive function that goes through the root path and all of its children to prepare the correct children dict
    for notebook rendering. Also renders the md files necessary for the notebook in the target directory.

    :param root_path: The path of the entity to check.
    :param target: The target path of where the md files should be
    created.
    :param indent: Should start with 0. Gets increased as the recursive increases. Used for the renderer to
    know how much this root_path should be indented in the _toc.yml file.
    :return: Dictionary with a tuple as keys,
    with the first item of the tuple being the target path of the md file, and second item the indentation level for
    that item. The value is `None` if this item does not have any children, or a dictionary with the same rules,
    indicating that this item contains children.

    """

    with open(root_path, 'rb') as f:
        data = toml.load(f)

    current_indent = indent+1
    data = data[next(iter(data))]

    children = data['children']

    if len(children) == 0:
        return None

    child_dict = {}.copy()
    for child in children:
        child_md = generate_md(child, target, images_path=resource_path)
        child_ret = _generate_children_dict(child, target, current_indent, resource_path=resource_path)
        # The only the stem is needed since the source files are located in the same directory as the root.
        child_dict[(child_md.stem, current_indent)] = child_ret

    return child_dict


def create_relation_dict(root_path: Path, target: Path, resource_path: Path) -> dict:
    """
    Goes through all of the children of root_path, and creates a dictionary identifying all the children. The root_path
    will get rendered in the target directory but will not be located in the dictionary itself, since this is not
    needed when rendering the _toc.yml file.

    :param root_path: The path of the root entity.
    :param target: The location of where the notebook should live.
    :return: A nested dictionary with all of the children of the root_path entity.
    """
    root_path_md = generate_md(root_path, target, resource_path)

    child_dict = _generate_children_dict(root_path, target, resource_path=resource_path, indent=0)
    return child_dict


def generate_book(root_path: Union[Path, str],
                  target_path: Union[Path, str],
                  logo_path: Optional[Union[Path, str]] = None,) -> None:
    """
    Generates a jupyter book from the root_path entity. This function will go through all of its chilren and render all
    of them in the target directory as md files. It will create _config.yml, _toc.yml, and files in the target location
    and render the jupyter book.

    :param root_path: The path of the root entity for the notebook.
    :param target_path: The location of where the notebook should live.
    :param logo_path: The path to the logo of the notebook. If `None` the default logo will be used.
    """

    if logo_path is None:
        logo_path = QDATADIR.joinpath('resource', 'qubit_logo.png')

    root_path = Path(root_path).absolute()

    if not target_path.exists():
        target_path.mkdir(exist_ok=True)

    if not target_path.is_dir():
        raise ValueError(f"Path {target_path} is not a directory.")

    if not root_path.exists():
        raise ValueError(f"Path {root_path} does not exist.")

    resource_path = target_path.joinpath('images')
    if not resource_path.exists():
        resource_path.mkdir(exist_ok=True)

    with open(root_path, 'rb') as f:
        data = toml.load(f)

    data = data[next(iter(data))]

    config_dict = dict(tittle=data['name'], author=data['user'], logo_path=logo_path)
    chapters = create_relation_dict(root_path, target_path, resource_path=resource_path)

    # Replacing whitespace in root so that links work
    root_path = Path(str(root_path).replace(' ', '_'))

    env = Environment(loader=FileSystemLoader(TEMPLATESDIR.joinpath('jupyterbook')))

    conf_template = env.get_template('_config.jinja')
    toc_template = env.get_template('_toc.jinja')

    conf_output = conf_template.render(config_dict)
    toc_output = toc_template.render(root=root_path.stem, chapters=chapters)

    with open(target_path.joinpath('_config.yml'), 'w') as f:
        f.write(conf_output)

    with open(target_path.joinpath('_toc.yml'), 'w') as f:
        f.write(toc_output)

    status = call("jupyter-book build .", cwd=str(target_path), shell=True)


