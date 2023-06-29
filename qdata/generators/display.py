import os
from enum import Enum, auto
from typing import Union, Tuple, List
from pathlib import Path

import tomllib as toml
from jinja2 import Template

from qdata import TEMPLATESDIR


class Supported(Enum):

    md = auto()
    string = auto()
    dir = auto()
    jpg = auto()
    png = auto()

    @classmethod
    def classify(cls, path: Union[Path, str]) -> 'Supported':
        path = Path(path)
        ext = path.suffix
        if path.is_file():
            try:
                return cls[ext.lower()[1::]]
            except Exception as e:
                raise ValueError(f'File type {ext} is not supported.')
        elif path.is_dir():
            return Supported.dir
        else:
            return Supported.string


def get_all_files(path: Union[Path, str]) -> list[Path]:
    """
    Recursively gets all files in a directory.

    :param path: The path to the directory.
    :return: List with all the files inside it.
    """
    file_list = []
    path = Path(path)

    # Iterate over all items in the directory
    for item in path.iterdir():
        if item.is_file():
            file_list.append(item.absolute())
        elif item.is_dir():
            file_list.extend(get_all_files(item))

    return file_list


def format_comment(comment: Union[Path, str]) -> Tuple[Union[str, List[str]], Union[str, List[str]]]:
    """
    Checks the type of comment, and formats the string value for it accordingly.

    :param comment: The comment to be formatted.Either a Path to a file or a string
    :return: If comment is a file or string, returns the key and value for the comment. If comment is a directory,
        returns a list of keys and values for all the files inside it.
    """

    key, val = None, None
    com_type = Supported.classify(comment)

    # For markdown bring the value of the md as string directly.
    if com_type == Supported.md:
        md_path = Path(comment)
        with open(md_path, 'r') as f:
            md = f.read()
            key = md_path.stem
            val = md

    # For string, key and val are equal
    elif com_type == Supported.string:
        key = comment
        val = comment

    # For any image type, we want to format the string for md to load the image.
    elif com_type == Supported.jpg or com_type == Supported.png:
        pic_path = Path(comment)
        # FIXME: The path that this guy is printing should be the resource folder.
        key = pic_path.stem
        val = f"![{pic_path.stem}]({pic_path.absolute()})"

    # For a directory, we assume that all the files inside it are images or comments that should be formatted.
    elif com_type == Supported.dir:
        key = []
        val = []
        for file in get_all_files(comment):
            k, v = format_comment(file)
            if isinstance(k, list):
                key.extend(k)
                val.extend(v)
            else:
                key.append(k)
                val.append(v)

    return key, val


def parser(path: Union[Path, str]) -> dict:
    """
    Parses a TOML file and returns a dictionary with the relevant information for entity md creation.

    :param path: The path for the TOML source.
    :return: The dictionary with the keys and vals that the jinja template needs.
    """

    with open(path, 'rb') as f:
        data = toml.load(f)

    data = data[[x for x in data.keys()][0]]
    # Basic fields
    ret = {"name": data['name'],
           "type": data['type'],
           "ID": data['ID'],
           "user": data['user'],
           "description": data['description']}

    # Fields with more complicated formatting
    if data['parent_link'] == '':
        ret["parent"] = None
    else:
        ret["parent"] = data['parent_link']

    comments = {}
    for com in data['comments']:
        key, val = format_comment(com)
        # If the comment is a directory, format_comment will return a list of keys and values.
        if isinstance(key, list):
            for k, v in zip(key, val):
                comments[k] = v
        else:
            comments[key] = val
    ret["comments"] = comments

    ret["children"] = data['related_links']

    return ret


# TODO: Make sure you move the pictures to the resource folder. We can make it such that we read it from source,
def generate_md(source: Union[Path, str],
                target: Union[Path, str] = None,
                template_path: Union[Path, str] = TEMPLATESDIR.joinpath("md_base.jinja")) -> Path:

    """
    Generates a markdown file from a TOML file. The name of the md file will be the same as the TOML file.

    :param source: Source of the TOML file.
    :param target: Directory where the markdown file will be saved.
    :param template_path: Path to the jinja template.
    :return: The path to the generated markdown file.
    """

    source = Path(source)
    if target is None:
        os.getcwd()
    target = Path(target).joinpath(source.stem + ".md")

    with open(template_path, 'r') as f:
        template_content = f.read()

    template = Template(template_content)

    vals_dict = parser(source)
    output = template.render(vals_dict)

    with open(target, 'w') as f:
        f.write(output)

    return target
