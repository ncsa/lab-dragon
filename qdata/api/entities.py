import json
from enum import Enum, auto
from pathlib import Path

from flask import abort, make_response, send_file

from qdata.modules.task import Task
from qdata.modules.step import Step
from qdata.modules.project import Project
from qdata.modules.instance import Instance
from qdata.generators.meta import read_from_TOML

ROOTPATH = Path(r'/Users/marcosf2/Documents/github/qdata-mockup/test/env_generator/Testing_Project.toml')

INDEX = {}

PATHINDEX = {}

# Inside the image index the string to identify the image is the ID of the entity + '--' + the name of the image
IMAGEINDEX = {}


def get_indices():

    index = json.dumps(str(INDEX))
    imageindex = json.dumps(str(IMAGEINDEX))

    ret = {'index': index, 'imageindex': imageindex, 'pathindex': PATHINDEX}
    return ret


class MediaTypes(Enum):
    """
    Enum that contains the different types of images that are supported
    """
    png = auto()
    jpg = auto()
    md = auto()

    @classmethod
    def is_supported(cls, media_path):
        media_path = Path(media_path)
        if media_path.suffix[1:] in cls.__members__:
            return True
        else:
            return False


def _reset_indices():
    global INDEX
    global IMAGEINDEX
    global PATHINDEX

    INDEX = {}
    IMAGEINDEX = {}
    PATHINDEX = {}


# TODO: This reshuffling of comments is breaking the order in which comments are displayed in the UI.
#  Order should be maintained even when expanding folders.
def read_child_entity(entity_path: Path):

    ent = read_from_TOML(entity_path)
    if ent.ID not in INDEX:
        INDEX[ent.ID] = ent

    if entity_path not in PATHINDEX:
        PATHINDEX[str(entity_path)] = ent.ID

    remove_comments = []
    add_comments = []
    for comment in ent.comments:
        c = Path(comment)
        if c.is_dir():
            remove_comments.append(comment)
            for media_file in c.iterdir():
                if media_file.is_file():
                    if MediaTypes.is_supported(media_file):
                        if ent.ID + '--' + media_file.name not in IMAGEINDEX:
                            IMAGEINDEX[ent.ID + '--' + media_file.name] = media_file
                add_comments.append(media_file.name)

        elif c.is_file():
            if MediaTypes.is_supported(c):
                if not ent.ID + '--' + c.name in IMAGEINDEX:
                    IMAGEINDEX[ent.ID + '--' + c.name] = c
            remove_comments.append(comment)
            add_comments.append(c.name)

    for comment in remove_comments:
        ent.comments.remove(comment)

    for comment in add_comments:
        ent.comments.append(comment)


    child_list = []
    if len(ent.children) > 0:
        for child in ent.children:
            child_list.append(read_child_entity(child))

    ret_dict = {"id": ent.ID,
                "name": ent.name,
                "type": ent.__class__.__name__,
                "children": child_list,
                }

    return ret_dict


def read_all():
    """
    Function that reads all the entities and return a dictionary with nested entities
    :return:
    """

    # Create the return dictionary
    ret = [read_child_entity(ROOTPATH)]

    # We replace the parent after we are done going through all identities to make sure that
    # the parent is already in the index, there might be edge cases where a lower entity in the tree has a parent
    # somewhere else (probably more important once we start allowing branching)

    # Update the parent of the children
    for key, val in INDEX.items():
        path = Path(val.parent)
        if path.is_file():
            val.parent = PATHINDEX[str(path)]

    return ret


def read_one(ID):
    """
    API function that returns an entity based on its ID
    """

    if ID not in INDEX:
        read_all()

    if ID in INDEX:
        ent = INDEX[ID]
        return json.dumps(ent.to_TOML()[ent.name]), 201
    else:
        abort(404, f"Entity with ID {ID} not found")


def read_image(ID, imageName):
    """
    API function that returns an image based on the ID of the entity and the name of the image
    """

    if ID + '--' + imageName in IMAGEINDEX:
        image = IMAGEINDEX[ID + '--' + imageName]
        return send_file(image)
    else:
        abort(404, f"Image with ID {ID} and name {imageName} not found")


def add_comment(ID, comment):

    ent = INDEX[ID]
    ent.comments.append(comment['text'])
    path = None
    for key, val in PATHINDEX.items():
        if val == ID:
            path = key
            break

    if path is None:
        return abort(404, f"Could not find the original location of entity")

    ent.to_TOML(path)
    return make_response("Comment added", 201)


