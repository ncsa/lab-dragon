import json
import copy
from pathlib import Path
from typing import Optional
from enum import Enum, auto

from flask import abort, make_response, send_file

from qdata.modules.task import Task
from qdata.modules.step import Step
from qdata.modules.entity import Entity
from qdata.modules.project import Project
from qdata.modules.instance import Instance
from qdata.generators.meta import read_from_TOML
from qdata.components.comment import SupportedCommentType, Comment

ROOTPATH = Path(r'/Users/marcosf2/Documents/github/qdata-mockup/test/env_generator/Testing Project.toml')

# List of classes that can contain children. Only Project and Task can contain children for now.
PARENT_TYPES = ["Project", "Task"]
ALL_TYPES = {"Project": Project, "Task": Task, "Step": Step}
# Holds all of the entity types that exists in the notebook
ENTITY_TYPES = set()

INDEX = {}

PATHINDEX = {}

# Inside the image index the string to identify the image is the ID of the entity + '--' + the name of the image
IMAGEINDEX = {}

# Holds all of the users that exists in the notebook
USERS = set()


def get_indices():

    index = json.dumps(str(INDEX))
    imageindex = json.dumps(str(IMAGEINDEX))

    ret = {'index': index, 'imageindex': imageindex, 'pathindex': PATHINDEX}
    return ret


def create_path_entity_copy(ent: Entity, index: Optional[dict] = None) -> Entity:
    """
    Returns a copy of the passed entity with any mention to a UUID replaced with the paths of the TOML files for that
    entity. This is used to convert from working with paths to working with UUID

    :param ent: The entity you want a copy with the UUIDs replaced with paths :param index: A reverse of the
     PATHINDEX dictionary. This is used to convert from UUID to paths If not passed, it will be created on demand. The
     intention of having it optional is to avoid having to compute it every time this function is called if this
     function gets called multiple times for a single operation. :return:
    """
    if index is None:
        index = {value: key for key, value in PATHINDEX.items()}

    copy_ent = copy.deepcopy(ent)
    if ent.parent in index:
        copy_ent.parent = index[ent.parent]

    children_paths = []
    for child in copy_ent.children:
        children_paths.append(index[child])
    copy_ent.children = children_paths
    return copy_ent


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

    # Add the user to the user index
    USERS.add(ent.user)

    # Add the entity type to the entity type index
    ENTITY_TYPES.add(ent.__class__.__name__)

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

    # We replace the parent and children after we are done going through all identities to make sure that
    # the parent is already in the index, there might be edge cases where a lower entity in the tree has a parent
    # somewhere else (probably more important once we start allowing branching)

    # Update the parent of the children
    for key, val in INDEX.items():
        path = Path(val.parent)
        if path.is_file():
            val.parent = PATHINDEX[str(path)]

        # Update the children of the parent
        for child in val.children:
            path = Path(child)
            if path.is_file():
                val.children[val.children.index(child)] = PATHINDEX[str(path)]

    return ret


def read_one(ID, name_only=False):
    """
    API function that returns an entity based on its ID
    """

    if ID not in INDEX:
        read_all()

    if ID in INDEX:
        ent = INDEX[ID]

        if name_only:
            return ent.name

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


def read_comment(ID, commentID):
    """
    API function that looks at the comment ID of the entity with ID and returns the comment

    :param ID:
    :param commentID:
    :return:
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    ids = [c.ID for c in ent.comments]
    if commentID not in ids:
        abort(404, f"Comment with ID {commentID} not found")
    ind = ids.index(commentID)
    if ind == -1:
        abort(404, f"Comment with ID {commentID} not found")
    comment = ent.comments[ind]
    content, media_type, author, date = comment.last_comment()
    if media_type == SupportedCommentType.jpg.value or media_type == SupportedCommentType.png.value:
        return send_file(content)
    else:
        return json.dumps(content), 201


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


def add_entity(**kwargs):
    """
    Creates an entity through the API call. It will add the entity to the parent and create the new TOML file
     immediately.

    :param kwargs: Dictionary with a single item with key 'body' and value a dictionary with the keys:
        * name: Name of the entity
        * type: Type of the entity
        * parent: ID of the parent entity
        * user: User that created the entity
    """
    body = kwargs['body']
    if "name" not in body or body['name'] == "":
        abort(400, "Name of entity is required")
    if "type" not in body or body['type'] == "":
        abort(400, "Type of entity is required")
    if "parent" not in body or body['parent'] == "":
        abort(400, "Parent of entity is required")
    if "user" not in body or body['user'] == "":
        abort(400, "User of entity is required")

    swapped_path_index = {value: key for key, value in PATHINDEX.items()}

    cls = ALL_TYPES[body['type']]
    ent = cls(name=body['name'], parent=body['parent'], user=body['user'])
    parent = INDEX[body['parent']]
    # Because the children do not have a path yet, you need to make a path copy before adding the child
    parent_copy = create_path_entity_copy(parent, swapped_path_index)

    # Add the child ID to the parent entity in memory.
    parent.children.append(ent.ID)

    INDEX[ent.ID] = ent

    # Create copy of the entity with paths to create the TOML file.
    ent_copy = create_path_entity_copy(ent, swapped_path_index)

    parent_path = Path(swapped_path_index[parent.ID])
    ent_path = parent_path.parent.joinpath(ent.name + '.toml')
    parent_copy.add_child(ent_path)
    parent_copy.to_TOML(parent_path)
    ent_copy.to_TOML(ent_path)

    return make_response("Entity added", 201)


def get_users():
    """
    API function that returns the list of users
    :return: json representation of a list of all the users in the system.
    """
    return json.dumps(list(USERS)), 201


def get_types():
    return json.dumps(list(ENTITY_TYPES)), 201


def get_possible_parents():
    """
    API function that returns a dictionary of all the entities
    that can have children with the keys being the ID of the entity and the value its name.
    This is used for the select item to display all the possible parents for new entities.
    :return: json representation of a list of all the possible parents for a given entity
    """
    ret = {}
    for k, v in INDEX.items():
        if v.__class__.__name__ in PARENT_TYPES:
            ret[k] = v.name
    return json.dumps(ret), 201

read_all()