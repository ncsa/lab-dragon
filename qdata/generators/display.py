from enum import Enum, auto
from typing import Union, Tuple
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
            if ext == '.md':
                return Supported.md
            elif ext == '.jpg':
                return Supported.jpg
            elif ext == '.png':
                return Supported.png
            else:
                raise ValueError(f"Unsupported file type: {ext}")
        elif path.is_dir():
            return Supported.dir
        else:
            return Supported.string


def get_all_files(path):
    file_list = []
    path = Path(path)

    # Iterate over all items in the directory
    for item in path.iterdir():
        if item.is_file():
            file_list.append(item.absolute())
        elif item.is_dir():
            file_list.extend(get_all_files(item))

    return file_list


def format_comment(comment):
    key, val = None, None
    com_type = Supported.classify(comment)
    if com_type == Supported.md:
        md_path = Path(comment)
        with open(md_path, 'r') as f:
            md = f.read()
            key = md_path.stem
            val = md
    elif com_type == Supported.string:
        key = comment
        val = comment
    elif com_type == Supported.jpg or com_type == Supported.png:
        pic_path = Path(comment)
        # FIXME: The path that this guy is printing should be the resource folder.
        key = pic_path.stem
        val = f"![{pic_path.stem}]({pic_path.absolute()})"
    elif com_type == Supported.dir:
        key = []
        val = []
        for file in get_all_files(comment):
            k, v = format_comment(file)
            if isinstance(k, list):
                key.extend(k)
                val.extend(v)

    return key, val


def parser(path: Union[Path, str]) -> dict:

    with open(path, 'rb') as f:
        data = toml.load(f)

    data = data[[x for x in data.keys()][0]]
    ret = {}
    ret["name"] = data['name']
    ret["type"] = data['type']
    ret["ID"] = data['ID']
    if data['parent_link'] == '':
        ret["parent"] = None
    else:
        ret["parent"] = data['parent_link']
    ret["user"] = data['user']
    ret["description"] = data['description']

    comments = {}
    for com in data['comments']:
        key, val = format_comment(com)
        comments[key] = val
    ret["comments"] = comments

    ret["children"] = data['related_links']

    return ret


# TODO: Make sure you move the pictures to the resource folder. We can make it such that we read it from source,
def generate_md(source: Union[Path, str],
                target: Union[Path, str] = None,
                template_path = TEMPLATESDIR.joinpath("md_base.jinja")) -> None:

    source = Path(source)
    target = Path(target).joinpath(source.stem + ".md")

    with open(template_path, 'r') as f:
        template_content = f.read()

    template = Template(template_content)

    vals_dict = parser(source)
    output = template.render(vals_dict)

    with open(target, 'w') as f:
        f.write(output)














