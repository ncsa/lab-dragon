"""
This module holds the code to generate markdown files from entity TOML files.
Each type of entity needs its own renderer class.
It does not necessarily have to be a child of entity renderer, but it has to implement the same things.
The 2 things that it needs to implement is the template attribute, which is the
path to the jinja template that it needs to render and the parser function.
The parser function goes through that entity TOML data file and parses the information there to a dictionary to
render the template with.`
"""
import os
import shutil
from enum import Enum, auto
from typing import Union, Tuple, List, Optional
from pathlib import Path

import tomllib as toml
from jinja2 import Environment, FileSystemLoader

from qdata import TEMPLATESDIR


class SupportedCommentType(Enum):

    md = auto()
    string = auto()
    dir = auto()
    jpg = auto()
    png = auto()

    @classmethod
    def classify(cls, item: Union[Path, str]) -> 'SupportedCommentType':
        item = Path(item)
        ext = item.suffix
        if item.is_file():
            try:
                return cls[ext.lower()[1::]]
            except Exception as e:
                raise ValueError(f'File type {ext} is not supported.')
        elif item.is_dir():
            return SupportedCommentType.dir
        else:
            return SupportedCommentType.string


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


class EntityRenderer:

    # All renderers have to specify the path to the template they use for rendering.
    template = TEMPLATESDIR.joinpath("md_entity.jinja")

    # If this is not None, image files will be copied to the image_path in a f
    image_path: Optional[Path] = None

    @classmethod
    def format_comment(cls, comment: Union[Path, str]) -> Tuple[Union[str, List[str]], Union[str, List[str]]]:
        """
        Checks the type of comment, and formats the string value for it accordingly.
        If the comment is a markdown file, get the text from the file, and it will render a section with the file name
        and the content under it. If the comment is an image, it will display a tittle with the file name and the image
        under it. If the comment is a directory, it will recursively go through all the files inside it and format them.

        :param comment: The comment to be formatted. Either a Path to a file or a string.
        :return: If comment is a file or string, returns the key and value for the comment. If comment is a directory,
            returns a list of keys and values for all the files inside it.
        """

        key, val = None, None
        com_type = SupportedCommentType.classify(comment)

        # For markdown bring the value of the md as string directly.
        if com_type == SupportedCommentType.md:
            md_path = Path(comment)
            with open(md_path, 'r') as f:
                md = f.read()
                key = md_path.stem
                val = md

        # For string, key and val are equal
        elif com_type == SupportedCommentType.string:
            key = comment
            val = comment

        # For any image type, we want to format the string for md to load the image.
        elif com_type == SupportedCommentType.jpg or com_type == SupportedCommentType.png:
            pic_path = Path(comment)
            name = pic_path.stem.replace("_", " ")
            if cls.image_path is None:
                key = pic_path.stem
                val = f"![{name}]({pic_path.absolute()})"
            # If rendering to the notebook, the path is to the images folder.
            else:
                target_path = cls.image_path.joinpath(pic_path.name)
                shutil.copy(pic_path, target_path)
                key = pic_path.stem
                val = f"![{name}](/images/{pic_path.name})"

        # For a directory, we assume that all the files inside it are images or comments that should be formatted.
        elif com_type == SupportedCommentType.dir:
            key = []
            val = []
            for file in get_all_files(comment):
                k, v = cls.format_comment(file)
                if isinstance(k, list):
                    key.extend(k)
                    val.extend(v)
                else:
                    key.append(k)
                    val.append(v)

        return key, val

    # FIXME: Make sure you correct the docstring since this thing does not read the TOML file anymore
    @classmethod
    def parser(cls, data: dict) -> dict:
        """
        Parses a TOML file and returns a dictionary with the relevant information for entity md creation.

        :param path: The path for the TOML source.
        :return: The dictionary with the keys and vals that the jinja template needs.
        """
        # Basic fields
        ret = {"name": data['name'].replace("_", " "),
               "type": data['type'],
               "ID": data['ID'],
               "user": data['user'],
               "description": data['description']}

        # Fields with more complicated formatting
        if data['parent'] == '':
            ret["parent"] = None
        else:
            data_path = Path(data['parent'])
            name = data_path.stem.replace("_", " ")
            if cls.image_path is None:
                ret["parent"] = f"[{name}]({data_path.with_suffix('.md').absolute()})"
            else:
                ret["parent"] = f"[{name}](./{data_path.with_suffix('.md').name})"

        comments = {}
        for com in data['comments']:
            key, val = cls.format_comment(com)
            # If the comment is a directory, format_comment will return a list of keys and values.
            if isinstance(key, list):
                for k, v in zip(key, val):
                    comments[k] = v
            else:
                comments[key] = val
        ret["comments"] = comments

        children = ""
        for child in data['children']:
            child_path = Path(child)
            if child_path.suffix == '.toml':
                name = child_path.stem.replace("_", " ")
                if cls.image_path is None:
                    children = children + f"[{name}]({child_path.with_suffix('.md').absolute()}), "
                else:
                    children = children + f"[{name}](./{child_path.with_suffix('.md').name}), "

        ret["children"] = children

        return ret


class ProjectRenderer(EntityRenderer):
    pass


class TaskRenderer(EntityRenderer):

    template = TEMPLATESDIR.joinpath("md_task.jinja")

    @classmethod
    def parser(cls, data: dict) -> dict:
        ret = super().parser(data)

        ret["objective"] = data['objective']
        ret["process"] = data['process']
        ret["start_time"] = data['start_time']
        ret["end_time"] = data['end_time']

        return ret


class StepRenderer(EntityRenderer):

    # FIXME: Once we have a better looking specific step template for this thing to work remember to switch this up.
    template = TEMPLATESDIR.joinpath("md_task.jinja")

    @classmethod
    def parser(cls, data: dict) -> dict:
        ret = super().parser(data)

        ret["process"] = ""
        ret["start_time"] = data['start_time']
        ret["end_time"] = data['end_time']

        return ret


class AvailableRenderers(Enum):
    """
    Simple enum to keep track of all the available renderers.
    Used so that the generate_md function knows what renderer to use depending on the TOML file directly.
    """

    Entity = EntityRenderer

    Project = ProjectRenderer

    Task = TaskRenderer

    Step = StepRenderer


# TODO: Make sure you move the pictures to the resource folder. We can make it such that we read it from source,
def generate_md(source: Union[Path, str],
                target: Optional[Union[Path, str]] = None,
                images_path: Optional[Union[Path, str]] = None,
                ) -> Path:

    """
    Generates a markdown file from a TOML file. The name of the md file will be the same as the TOML file.

    :param source: Source of the TOML file.
    :param target: Directory where the markdown file will be saved.
    :param images_path: Directory where the resources for the markdown file will be saved.
        This is used when creating a md for a jupyterbook where all the resources should be located at a central
        resource folder, with all the comment
    links relative to the resource folder, even if the md is located somewhere else.
    :return: The path to the generated markdown file.

    """

    source = Path(source)
    if target is None:
        target = os.getcwd()
    target = Path(target).joinpath(source.stem + ".md")

    if images_path is not None:
        images_path = Path(images_path)

    with open(source, 'rb') as f:
        data = toml.load(f)

    data = data[next(iter(data))]

    env = Environment(loader=FileSystemLoader(TEMPLATESDIR))

    if not hasattr(AvailableRenderers, data['type']):
        raise ValueError(f"Type {data['type']} Does not have a renderer.")
    renderer = getattr(AvailableRenderers, data['type']).value
    renderer.image_path = images_path
    template = env.get_template(renderer.template.name)

    vals_dict = renderer.parser(data)
    output = template.render(vals_dict)

    if not target.exists():
        target.touch()

    with open(target, 'w') as f:
        f.write(output)

    return target
