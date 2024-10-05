import os
import re
import json
import copy
import random
import string
import warnings
from pathlib import Path
from enum import Enum, auto
from typing import Optional, Union, Tuple

import nbformat
import markdown
import imagehash
from PIL import Image
from nbconvert import HTMLExporter
from werkzeug.utils import secure_filename
from flask import abort, make_response, send_file, current_app
from markdown.extensions.tables import TableExtension

# TODO: Once you have tested remove the old generate_all_classes
# Refresh the modules before starting the server
# from dragon_core.generators.meta import generate_all_classes, delete_all_modules
# delete_all_modules()
# generate_all_classes()

from dragon_core.modules import Entity, Library, Notebook, Project, Task, Step, Bucket, Instance, DragonLair

from dragon_core.generators.meta import read_from_TOML
from dragon_core.components.comment import SupportedCommentType, Comment
from .converters import MyMarkdownConverter,  CustomLinkExtension, CustomHeadlessTableExtension


# Config coming from starting script.
CONFIG = current_app.config['API_config']

ROOTPATH: Path = Path(CONFIG['notebook_root'])

LAIRSPATH: Path = Path(CONFIG['lairs_directory'])

RESOURCEPATH: Path = Path(CONFIG['resource_path'])


DRAGONLAIR: Optional[DragonLair] = None

# List of classes that can contain children. Only Project and Task can contain children for now.
PARENT_TYPES = []
ALL_TYPES = {}
# Holds all of the entity types that exists in the notebook
ENTITY_TYPES = set()

# Holds all of the entities that exists in the notebook, uuid as key and the entity as value.
INDEX = {}

# Holds as keys the paths to the TOML files and as values the UUID of the entity
PATH_TO_UUID_INDEX = {}
# Holds as keys the UUIDs of entities and as values the path to the TOML files
UUID_TO_PATH_INDEX = {}

# Holds as keys the hash of an image and as value the absolute path to that image.
#  This is used to check if an image already exists
IMAGEINDEX = {}

INSTANCEIMAGE = {}

# Holds all of the users that exists in the notebook
USERS: set = CONFIG['users']


def set_initial_indices():
    global CONFIG
    global ROOTPATH
    global LAIRSPATH
    global RESOURCEPATH
    global DRAGONLAIR
    global PARENT_TYPES
    global ALL_TYPES
    global ENTITY_TYPES
    global INDEX
    global PATH_TO_UUID_INDEX
    global UUID_TO_PATH_INDEX
    global IMAGEINDEX
    global INSTANCEIMAGE
    global USERS

    ROOTPATH = Path(CONFIG['notebook_root'])

    LAIRSPATH = Path(CONFIG['lairs_directory'])

    RESOURCEPATH = Path(CONFIG['resource_path'])

    DRAGONLAIR = DragonLair(LAIRSPATH)

    # List of classes that can contain children. Only Project and Task can contain children for now.
    PARENT_TYPES = ["Library", "Notebook", "Project", "Task"]
    ALL_TYPES = {"Project": Project, "Task": Task, "Step": Step, "Library": Library, "Notebook": Notebook}
    # Holds all of the entity types that exists in the system.
    ENTITY_TYPES = {"Library", "Notebook", "Project", "Task", "Step"}

    INDEX = {}

    # Holds as keys the paths to the TOML files and as values the UUID of the entity
    PATH_TO_UUID_INDEX = {}
    # Holds as keys the UUIDs of entities and as values the path to the TOML files
    UUID_TO_PATH_INDEX = {}

    # Holds as keys the hash of an image and as value the absolute path to that image.
    #  This is used to check if an image already exists
    IMAGEINDEX = {}

    INSTANCEIMAGE = {}

    # Holds all of the users that exists in the notebook
    USERS = set(copy.copy(CONFIG['users']))


def reset():
    set_initial_indices()
    load_system()


def get_indices():

    index = json.dumps(str(INDEX))
    imageindex = json.dumps(str(IMAGEINDEX))

    ret = {'index': index, 'imageindex': imageindex, 'PATH_TO_UUID_INDEX': PATH_TO_UUID_INDEX}
    return ret


def create_path_entity_copy(ent: Entity) -> Entity:
    """
    Returns a copy of the passed entity with any mention to a UUID replaced with the paths of the TOML files for that
    entity. This is used to convert from working with paths to working with UUID

    :param ent: The entity you want a copy with the UUIDs replaced with paths :param index: A reverse of the
     PATH_TO_UUID_INDEX dictionary. This is used to convert from UUID to paths If not passed, it will be created on demand. The
     intention of having it optional is to avoid having to compute it every time this function is called if this
     function gets called multiple times for a single operation. :return:
    """
    copy_ent = copy.deepcopy(ent)
    if ent.parent in UUID_TO_PATH_INDEX:
        copy_ent.parent = UUID_TO_PATH_INDEX[ent.parent]

    children_paths = []
    for child in copy_ent.children:
        children_paths.append(UUID_TO_PATH_INDEX[child])
    copy_ent.children = children_paths

    comments = []
    for comment in copy_ent.comments:
        content = []
        for cont, category in zip(comment.content, comment.com_type):
            if category == SupportedCommentType.md.value or category == SupportedCommentType.string.value:
                content.append(comment_path_to_uuid(cont))
            else:
                content.append(cont)

        comment.content = content
        comments.append(comment)

    return copy_ent


def comment_path_to_uuid(content: str):

    def replacer(match):
        # Extract the text and file path from the match
        text = match.group(1)
        file_path = match.group(2)
        # If the file path is a key in the replacements dictionary, replace it
        # Otherwise, keep the original file path
        new_file_path = PATH_TO_UUID_INDEX.get(file_path, file_path)
        # Return the reconstructed string with the replacement file path
        return f'{text}({new_file_path})'

    # Regex pattern for file paths preceded by text in square brackets and enclosed in parentheses
    pattern = r'(\[.*?\])\(([\w\-.\/\s]+)\)'

    replaced_s = re.sub(pattern, replacer, content)
    return replaced_s


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
    global PATH_TO_UUID_INDEX

    INDEX = {}
    IMAGEINDEX = {}
    PATH_TO_UUID_INDEX = {}


def add_ent_to_index(entity: Entity, entity_path: Union[Path, str]) -> None:
    """
    Adds an entity to all the necessary memory indices.

    :param entity: The entity which is being added to the index.
    :param entity_path: The path on disk to the TOML file that contains the entity.
    """

    if entity.ID not in INDEX:
        INDEX[entity.ID] = entity

    if entity_path not in PATH_TO_UUID_INDEX:
        PATH_TO_UUID_INDEX[str(entity_path)] = entity.ID

    if entity.ID not in UUID_TO_PATH_INDEX:
        UUID_TO_PATH_INDEX[entity.ID] = str(entity_path)

    # Add the user to the user index
    USERS.add(entity.user)

    # Add the entity type to the entity type index
    # ENTITY_TYPES.add(entity.__class__.__name__)


def add_image_to_index(image, image_path):
    """
    Adds an image to the image index

    :param image: a PIL image instance
    :param image_path: The path on disk of that image
    """
    img_hash = imagehash.average_hash(image)
    if img_hash not in IMAGEINDEX:
        IMAGEINDEX[img_hash] = image_path
    # Currently commented out because we are not checking for duplicates
    # elif str(IMAGEINDEX[img_hash]) != str(image_path):
    #     print(f'duplicated image has been found, will ignore the new image {image_path}')


def find_equivalent_image(image, threshold=0.1):
    """
    Checks if there is an equivalent image in the system. Does this by calculating the imagehash and comparing it every
    other image until either it finds a match or does not find any match. If no match has been found, returns None,
    if a match has been found, returns the hash of the found image

    :param image: PIL instance of an image
    :param threshold: The bigger this is, the more different an image can be to be considered equivalent
    """

    img_hash = imagehash.average_hash(image)

    ret_path = None
    for hash, path in IMAGEINDEX.items():
        diff = hash - img_hash
        if diff <= threshold:
            ret_path = path
            break
    return ret_path


def initialize_bucket(bucket_path):
    """
    Function that initializes a bucket by adding it to the index and initializing the instances it contains.

    :param bucket: The bucket that is being initialized.
    """
    bucket = read_from_TOML(bucket_path)

    add_ent_to_index(bucket, bucket_path)

    for ins_path in bucket.path_to_uuid.keys():
        instance = read_from_TOML(ins_path)
        add_ent_to_index(instance, ins_path)

        # add images to the image index
        for img_path in instance.images:
            path = Path(img_path).resolve()
            # Only need to add image if it is an actual image, not html plot
            if path.suffix == '.jpg' or path.suffix == '.png':
                img = Image.open(path)
                add_image_to_index(img, img_path)
                INSTANCEIMAGE[img_path] = instance.ID
            elif path.suffix == '.html':
                pass

    return bucket


def process_comments(entity):
    """
    Function that processes the comments of an entity and checks for markdown links.

    :param entity: The entity whose comments are being processed.
    """
    # Regular expression pattern for markdown links
    pattern = r'\[(.*?)\]\((.*?)\)'

    for comment in entity.comments:
        for content in comment.content:
            if isinstance(content, str):
                matches = re.findall(pattern, content)
                for match in matches:
                    # Tries converting it to path and see if the path exists.
                    # Catches all failures because we don't want to crash if the path doesn't or isn't a path format.
                    try:
                        path = Path(match[1]).resolve()
                    except Exception as e:
                        continue
                    if path.exists() and path.suffix == '.jpg' or path.suffix == '.png':
                        img = Image.open(path)
                        add_image_to_index(img, path)


def recursively_load_entity(entity_path: Path):
    """
    Loads an entity from a TOML file and recursively loads all of its children as well.
    """

    ent = read_from_TOML(entity_path)

    add_ent_to_index(ent, entity_path)

    # Add the user to the user index
    USERS.add(ent.user)

    child_list = []
    if len(ent.children) > 0:
        for child in ent.children:
            try:
                ent_dict, child = recursively_load_entity(child)
                child_list.append(ent_dict)
            except Exception as e:
                print(f"Error reading child {ent.name} with path {UUID_TO_PATH_INDEX[ent.ID]}")
                raise e

    data_buckets = []
    for bucket_path in ent.data_buckets:
        bucket = initialize_bucket(bucket_path)
        data_buckets.append(bucket.ID)

    process_comments(ent)

    # TODO: Figure out why this line is commented
    # ent.data_buckets = data_buckets

    ret_dict = {"id": ent.ID,
                "name": ent.name,
                "type": ent.__class__.__name__,
                "children": child_list,
                }

    return ret_dict, ent


def health_check():
    """
    Function that checks if the server is running
    """
    return make_response("Server is running", 201)


def load_system():
    """
    Function that reads all the entities and return a dictionary with nested entities
    :return:
    """

    for dragon_library in DRAGONLAIR.libraries:
        library = recursively_load_entity(dragon_library.path)
        DRAGONLAIR.insert_instance(library)

    # We replace the parent and children after we are done going through all identities to make sure that
    # the parent is already in the index, there might be edge cases where a lower entity in the tree has a parent
    # somewhere else (probably more important once we start allowing branching)

    # Update the parent of the children
    for key, val in INDEX.items():
        path = Path(val.parent)
        if path.is_file():
            val.parent = PATH_TO_UUID_INDEX[str(path)]

        # Update the children of the parent
        for child in val.children:
            path = Path(child)
            if path.is_file():
                val.children[val.children.index(child)] = PATH_TO_UUID_INDEX[str(path)]


def _generate_structure_helper(ID):

    ent = INDEX[ID]
    children = [_generate_structure_helper(child) for child in ent.children]
    name = ent.name
    ID = ent.ID
    type_ = ent.__class__.__name__
    return {"name": name, "id": ID, "children": children, "type": type_}


def generate_structure():
    return make_response(json.dumps([_generate_structure_helper(PATH_TO_UUID_INDEX[str(ROOTPATH)])]), 201)


# FIXME: This is a bad name, it should probably be read entity or something like that instead.
def read_one(ID, name_only=False):
    """
    API function that returns an entity based on its ID
    """

    if ID not in INDEX:
        load_system()

    if ID in INDEX:
        ent = INDEX[ID]

        if name_only:
            return ent.name, 200

        ent_copy = copy.deepcopy(ent)
        for comment in ent_copy.comments:
            if comment.com_type[-1] == SupportedCommentType.md.value or comment.com_type[-1] == SupportedCommentType.string.value:
                replaced_path = comment_path_to_uuid(comment.content[-1])
                html_comment = markdown_to_html.convert(replaced_path)
                comment.content[-1] = html_comment

        # If it is an instance, convert the notebooks into html
        if isinstance(ent, Instance):
            converted_analysis = []
            for analysis_nb in ent_copy.analysis:
                    # Read the notebook
                    nb = nbformat.read(analysis_nb, as_version=4)

                    # Create HTML exporter
                    html_exporter = HTMLExporter()
                    html_exporter.theme = "dark" # Change the theme of the notebook
                    html_exporter.template_name = 'classic'  # use classic template (you can change this)

                    # Export the notebook to HTML format
                    (body, resources) = html_exporter.from_notebook_node(nb)
                    converted_analysis.append((Path(analysis_nb).stem, str(body)))

            # TOML table does not like having a string that is as long as an html file so the conversion needs to happen
            # after the TOML conversion.
            serialized = dict(ent_copy.to_TOML()[ent_copy.name])
            serialized['analysis'] = converted_analysis

            return json.dumps(serialized), 201

        return json.dumps(ent_copy.to_TOML()[ent_copy.name]), 201
    else:
        abort(404, f"Entity with ID {ID} not found")


def read_image(imagePath):
    """
    API function that returns an image based on the ID of the entity and the name of the image
    """
    try:
        path = Path(imagePath.replace('#', '/')).resolve()
        return send_file(path)
    except Exception as e:
        abort(404, f"Image with path {imagePath} not found")


def read_comment(ID, commentID, whole_comment=False, HTML=False):
    """
    API function that looks at the comment ID of the entity with ID and returns the comment

    :param ID:
    :param commentID:
    :param whole_comment: if True, returns the whole comment, if False, returns only the last content.
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

    if whole_comment:
        if HTML:
            comment_copy = copy.deepcopy(comment)
            converted_content = []
            for cont in comment.content:
                replaced_path = comment_path_to_uuid(cont)
                html_comment = markdown_to_html.convert(replaced_path)
                converted_content.append(html_comment)
            comment_copy.content = converted_content
            return json.dumps(str(comment_copy)), 201
        else:
            return json.dumps(str(comment)), 201
    else:
        return json.dumps(content), 201


def generate_tree(ID: str, deepness: int = 7):
    """
    Deepness is the number of levels of children that are included in the tree.
    as well as how many children per level are returning.

    :param ent: The entity to generate the tree from
    :param deepness: How many items and levels (rank) to include in the tree.
    """
    new_node = "├── "
    last_node = "└── "
    empty_node = "    "
    vertical_node = "│   "
    incomplete_node = "└ ⋯ "

    def populate_tree(ent, deepness, parent_tree, level=0):
        if level == deepness:
            return parent_tree

        parent_tree[ent.name] = {}
        for i, child in enumerate(ent.children):
            if i == deepness:
                break
            populate_tree(INDEX[child], deepness, parent_tree[ent.name], level+1)

        if len(parent_tree[ent.name]) == len(ent.children):
            parent_tree[ent.name]["__complete__"] = True
        else:
            parent_tree[ent.name]["__complete__"] = False
        return parent_tree

    def make_tree(data, ret_="", fill_indent=0, empty_indent=0):
        n_keys = len(list(data.keys()))
        lines = ret_.split("\n")

        # you need to change from fill indent to empty indent in the last row
        # so that lines that head to nowhere don't appear
        if len(lines) >= 2 and last_node in lines[-2]:
            empty_indent += 1
            fill_indent -= 1

        if fill_indent + empty_indent == 0:
            keys = list(data.keys())
            ret_ += keys[0] + "\n"
            ret_ = make_tree(data[keys[0]], ret_, fill_indent, empty_indent + 1)
        else:
            for i, (key, value) in enumerate(data.items()):
                if key == "__complete__":
                    if value:
                        continue
                    else:
                        new_addition = empty_node * empty_indent + fill_indent * vertical_node + incomplete_node + "\n"
                        ret_ += new_addition
                    continue

                # Deciding what node to use, if last or new one
                # You need -2 because the complete key is metadata
                selected_node = new_node
                if i == n_keys - 2 and data["__complete__"] is True:
                    selected_node = last_node

                new_addition = empty_node * empty_indent + fill_indent * vertical_node + selected_node + key + "\n"
                ret_ += new_addition
                ret_ = make_tree(value, ret_, fill_indent + 1, empty_indent)
        return ret_

    ent = INDEX[ID]

    tree = {}
    tree = populate_tree(ent, deepness, tree)
    ret = make_tree(tree)
    return make_response(json.dumps(ret), 201)


def _get_rank_and_num_children(ent: Entity) -> Tuple[int, int]:
    """
    Recursive helper function. Returns the rank of the entity and the total number of children it has.

    :param ent: The current entity that we are going over.
    :return: The number of entities that are child of ent as well as the rank of this entity.
    """
    rank = 0
    num_children = 0
    for child_id in ent.children:
        if child_id in INDEX:
            num_children += 1
            child = INDEX[child_id]
            child_rank, child_num_children = _get_rank_and_num_children(child)
            rank = max(rank, child_rank + 1)
            num_children += child_num_children

    return rank, num_children


def read_entity_info(ID):
    """
    For now, this function only figures out the "rank" and the total number of children it has.
    By "rank" we mean how many levels deep the children go, multiple siblings do not add to this number.

    :param ID:
    :return:
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    rank, num_children = _get_rank_and_num_children(ent)
    return make_response(json.dumps({"rank": rank, "num_children": num_children}), 201)


def add_comment(ID, body, username: Optional[str] = None, HTML: bool = False):
    """
    Adds a comment to the indicated entity. It does not handle images or tables yet.

    :param ID: The id of the entity the comment should be added to.
    :param body: The text of the comment itself.
    :param username: Optional argument. If passed, the author of the comment will be that username instead of the
     user of the entity.
    :param HTML: If true, the comment text is assumed to be in html form and is converted to markdown.
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    if username is None:
        username = ent.user

    if HTML:
        content = html_to_markdown.convert(body)
    else:
        content = body

    ent.add_comment(content, username)

    # After adding the comment update the file location
    ent_path = Path(UUID_TO_PATH_INDEX[ID])
    copy_ent = create_path_entity_copy(ent)
    copy_ent.to_TOML(ent_path)

    return make_response("Comment added", 201)


def edit_comment(ID, commentID, body, username: Optional[str] = None, HTML: bool = False):

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]

    if HTML:
        body = html_to_markdown.convert(body)

    try:
        ret = ent.modify_comment(commentID, body, username)
        if ret:
            # Convert uuids in the entity to paths
            path_copy = create_path_entity_copy(ent)
            path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))
            return make_response("Comment edited successfully", 201)
    except ValueError as e:
        abort(400, str(e))

    return abort(400, "Something went wrong, try again")


def add_library(body):
    """
    Creates a new library and adds it to the system.

    :param body: dictionary with the keys:
        * name: Name of the library
        * user: User that created the library
    """
    if "name" not in body or body['name'] == "":
        abort(400, "Name of library is required")
    if "user" not in body or body['user'] == "":
        abort(400, "User of library is required")

    library = Library(name=body['name'], user=body['user'])
    lib_path = LAIRSPATH.joinpath(library.ID[:8] + '_' + library.name + '.toml')

    path_copy = create_path_entity_copy(library)
    path_copy.to_TOML(lib_path)

    DRAGONLAIR.add_library(library, lib_path)

    return make_response("Library added", 201)


def add_entity(body):
    """
    Creates an entity through the API call. It will add the entity to the parent and create the new TOML file
     immediately.

    :param body: dictionary with the keys:
        * name: Name of the entity
        * type: Type of the entity
        * parent: ID of the parent entity
        * user: User that created the entity
    """
    if "name" not in body or body['name'] == "":
        abort(400, "Name of entity is required")
    if "type" not in body or body['type'] == "":
        abort(400, "Type of entity is required")
    if "parent" not in body or body['parent'] == "":
        abort(400, "Parent of entity is required")
    if "user" not in body or body['user'] == "":
        abort(400, "User of entity is required")

    cls = ALL_TYPES[body['type']]
    ent = cls(name=body['name'], parent=body['parent'], user=body['user'])
    parent = INDEX[body['parent']]
    parent_path = Path(UUID_TO_PATH_INDEX[parent.ID])
    ent_path = parent_path.parent.joinpath(ent.ID[:8] + '_' + ent.name + '.toml')

    # Because the children do not have a path yet, you need to make a path copy before adding the child
    parent_copy = create_path_entity_copy(parent)

    add_ent_to_index(ent, ent_path)

    # Add the child ID to the parent entity in memory.
    parent.children.append(ent.ID)

    # Create copy of the entity with paths to create the TOML file.
    ent_copy = create_path_entity_copy(ent)

    parent_copy.add_child(ent_path)
    parent_copy.to_TOML(parent_path)
    ent_copy.to_TOML(ent_path)

    return make_response("Entity added", 201)


def delete_entity(ID):
    """
    Deletes an entity from the system. It will remove the entity from the parent and delete the TOML file
     immediately.

    :param ID: The ID of the entity to delete
    """
    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    parent = INDEX[ent.parent]

    # Flag the entity as deleted
    ent.deleted = True
    ent_copy = create_path_entity_copy(ent)
    ent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))

    # Remove the entity from the parent
    parent.children.remove(ID)
    parent_copy = create_path_entity_copy(parent)
    parent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[parent.ID]))

    # Remove the entity from the index
    del INDEX[ID]

    # Remove the entity from the path to UUID index
    del PATH_TO_UUID_INDEX[UUID_TO_PATH_INDEX[ID]]

    # Remove the entity from the UUID to path index
    del UUID_TO_PATH_INDEX[ID]

    return make_response("Entity deleted", 201)


# FIXME: At the moment you cannot change the name of the root of the notebook.
def change_entity_name(ID, body):
    """
    Changes the name of an entity and updates the TOML file.

    :param ID: id of the entity
    :param body[new_name]: new name of the entity
    """

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")
    if "new_name" not in body or body['new_name'] == "":
        abort(400, "New name of entity is required")

    new_name = body['new_name']

    ent = INDEX[ID]
    ent.change_name(new_name)
    old_ent_path = Path(UUID_TO_PATH_INDEX[ID])
    new_ent_path = old_ent_path.parent.joinpath(f"{ID[:8]}_" + new_name + '.toml')

    # Update the UUID indexes
    del PATH_TO_UUID_INDEX[str(old_ent_path)]
    PATH_TO_UUID_INDEX[str(new_ent_path)] = ID
    UUID_TO_PATH_INDEX[ID] = str(new_ent_path)

    # Update the TOML file
    ent_copy = create_path_entity_copy(ent)
    ent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))

    # Update parents
    parent = INDEX[ent.parent]
    parent_copy = create_path_entity_copy(parent)
    parent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[parent.ID]))

    # Update the children
    for child in ent.children:
        child_ent = INDEX[child]
        child_ent_copy = create_path_entity_copy(child_ent)
        child_ent_copy.to_TOML(Path(UUID_TO_PATH_INDEX[child]))

    if new_ent_path.is_file():
        old_ent_path.unlink()
    else:
        abort(400, f"Could not find the file {old_ent_path}")

    return make_response("Entity name changed", 201)


# FIXME: Left here for now as reference. This function tries to find similar images in the system and reutrns that path.
#  This has proven to be more harmful than usefull. In the future a modal might appear saying that it found this image,
#  if the user wants to use that instead of uploading one that might work. But for now let's leave it depreceated
def _add_image_depreceated(body, image):
    """
    Adds an image to the notebook. Checks if the image already exists in the system. if it doesn't, copy the image into
    resource.

    :param body: Text of the tag being added. usually empty
    :param image: The image you get from the flask call.
    """
    warnings.warn("This function is deprecated and will be removed in the future", DeprecationWarning)

    converted_image = Image.open(image.stream)
    image_path = find_equivalent_image(converted_image)

    if image_path is None:
        # Save the image to the RESOURCEPATH
        filename = secure_filename(image.filename)
        image_path = RESOURCEPATH.joinpath(filename)
        converted_image.save(image_path)
        add_image_to_index(Image.open(image_path), image_path)

    image_url = f"/api/properties/image/{str(image_path).replace('/', '%23')}"

    return make_response(image_url, 201)


def add_image(body, image):
    """
    Adds and image to the notebook. If an image with the same name is already present in the RESOURCEPATH, it will
    add a random string to the name to avoid overwriting the image.

    :param body: Text of the tag being added. Usually empty.
    :param image: The image you get from the flask call.
    :return: The relative URL to the new image.
    """
    converted_image = Image.open(image.stream)
    filename = secure_filename(image.filename)
    file_path = RESOURCEPATH.joinpath(filename)

    while file_path.is_file():
        f_parts = filename.split('.')
        if len(f_parts) != 2:
            abort(400, "The filename is not in the correct format")
        new_name = f_parts[0] + '_' + ''.join(random.choice(string.ascii_letters) for i in range(6)) + '.' + f_parts[1]
        file_path = RESOURCEPATH.joinpath(new_name)

    converted_image.save(file_path)
    add_image_to_index(converted_image, file_path)
    image_url = f"/api/properties/image/{str(file_path).replace('/', '%23')}"
    return make_response(image_url, 201)


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


def _search_parents_with_buckets(ent):
    """
    Recursive function that searches for parent entities with data buckets

    :param ent: The entity to search
    :return: The entity with data buckets, or None if no entity with data buckets can be found
    """
    if ent.parent == "":
        return None

    ret_ent = INDEX[ent.parent]
    if len(ret_ent.data_buckets) == 0:
        ret_ent = _search_parents_with_buckets(ret_ent)

    return ret_ent


# FIXME: The return value should have the keys and value of the dictionary flipped.
def get_data_suggestions(ID, query_filter="", num_matches=10):
    """
    Returns matched datasets in a bucket with the query.
    If the entity does not have a bucket, it will search the parents for buckets or return None if no buckets are found.

    :param ID: The id of the entity to search
    :param query: The query to match
    :param num_matches: How many matches until the function stops looking for matches.

    :return: Dictionary with the name of data as keys and the id as values
    """
    matches = {}
    ent = INDEX[ID]
    if len(ent.data_buckets) == 0:
        ent = _search_parents_with_buckets(ent)
        if ent is None:
            return json.dumps({}), 201

    for bucket_path in ent.data_buckets:
        bucket_id = PATH_TO_UUID_INDEX[str(bucket_path)]
        bucket = INDEX[bucket_id]
        pattern = re.compile(query_filter)
        for p, uuid in bucket.path_to_uuid.items():
            if len(matches) >= num_matches:
                break
            path = Path(p)
            instance = INDEX[uuid]
            if 'star' in instance.tags:
                if query_filter == "" or query_filter is None:
                    matches[path.stem] = uuid
                else:
                    if pattern.search(path.stem):
                        matches[path.stem] = uuid

    return json.dumps(matches), 201


def get_graphic_suggestions(ID, query_filter="", num_matches=10):
    """
    Look for images inside of a data bucket. This includes html files containg hvplots.

    :param ID: The ID of the instance you are searching
    :param query_filter: A query to find matches to
    :param num_matches: How many matches until the function stops looking for matches.

    :return: Dictionary with the name of data + images as keys and a 2 object tuple where the first item is the paths to
        the images and second the uuid of the instance they are a part of as values.
    """
    matches = {}
    ent = INDEX[ID]
    if len(ent.data_buckets) == 0:
        ent = _search_parents_with_buckets(ent)
        if ent is None:
            return json.dumps({}), 201

    for bucket_path in ent.data_buckets:
        bucket_id = PATH_TO_UUID_INDEX[str(bucket_path)]
        bucket = INDEX[bucket_id]
        pattern = re.compile(query_filter)
        for p, uuid in bucket.path_to_uuid.items():
            if len(matches) >= num_matches:
                break
            instance = INDEX[uuid]
            if 'star' in instance.tags:
                for im_p in instance.images:
                    p_obj = Path(im_p)
                    image_name = p_obj.parts[-2] + "/" + p_obj.parts[-1] # The folder name + the image
                    if (p_obj.suffix == '.html' or p_obj.suffix == '.jpg' or p_obj.suffix == '.png') and pattern.search(image_name):
                        matches[image_name] = (im_p.replace('/', '%23'), instance.ID)
                    
    return json.dumps(matches), 201


def add_instance(body):
    """
    API function that adds an instance to a bucket

    body should be a dictionary with the following keys
        * bucket_ID: The ID of the bucket to add the instance to
        * data_loc: The path of the data that the instance is based on
        * username: The user that created the instance
        * start_time: The start time of the instance
        * end_time: The end time of the instance
    """

    if "bucket_ID" not in body or body['bucket_ID'] == "":
        abort(404, f"Bucket ID is required")
    bucket_ID = body['bucket_ID']
    if "data_loc" not in body or body['data_loc'] == "":
        abort(404, f"Data loc is required")
    data_path = body['data_loc']
    if "username" not in body or body['username'] == "":
        abort(404, f"Username is required")
    username = body['username']

    start_time = body.get('start_time', None)
    end_time = body.get('end_time', None)

    if bucket_ID not in INDEX:
        abort(404, f"Entity with ID {bucket_ID} not found")

    bucket = INDEX[bucket_ID]

    if not isinstance(bucket, Bucket):
        abort(400, f"Entity with ID {bucket_ID} is not a bucket")

    # Path to the folder containing the data file
    data_path = Path(data_path)
    if not Path(data_path).is_dir():
        abort(403, f"Data with path {data_path} not found")

    data_file = data_path.joinpath('data.ddh5')
    if not data_file.is_file():
        abort(403, f"Data with path {data_file} not found")

    instance = Instance(name=data_path.name, data=[str(data_file)], user=username, start_time=start_time, end_time=end_time)

    instance_path = data_path.joinpath(instance.ID[:8] + '_' + data_path.name + '.toml')
    bucket.add_instance(instance_path, instance.ID)

    bucket_copy = create_path_entity_copy(bucket)
    bucket_copy.to_TOML(Path(UUID_TO_PATH_INDEX[bucket_ID]))

    instance_copy = create_path_entity_copy(instance)
    instance_copy.to_TOML(instance_path)

    add_ent_to_index(instance, instance_path)

    return make_response("Instance added", 201)


def add_analysis_files_to_instance(body):
    """
    Adds a list of analysis files to the specified instance. The body should be a dictionary with the following keys:
        * data_loc: The path to the instance. We use path instead of ID because the measurement setups should not know what the ids are.
        * analysis_files: A list of paths to the analysis files to add to the instance. The function will check if the files exists and sort them correctly.
    """

    if "data_loc" not in body or body['data_loc'] == "":
        abort(404, f"Data loc is required")
    data_path = Path(body['data_loc'])
    if str(data_path) not in PATH_TO_UUID_INDEX:
        abort(404, f"Data with path {data_path} not found")
    uuid_ = PATH_TO_UUID_INDEX[str(data_path)]
    if uuid_ not in INDEX:
        abort(404, f"Instance with path {data_path} not found")
    instance = INDEX[uuid_]

    if "analysis_files" not in body or body['analysis_files'] == "":
        abort(400, f"No analysis files are provided")

    analysis_files = body['analysis_files']
    if not isinstance(analysis_files, list):
        abort(400, f"Analysis files should be a list")

    for analysis_file in analysis_files:
        path = Path(analysis_file)
        if not path.is_file():
            abort(404, f"Analysis file with path {path} not found")

        if path.suffix == '.jpg' or path.suffix == '.png':
            if path not in instance.images and analysis_file not in instance.images:
                img = Image.open(path)
                add_image_to_index(img, path)
                instance.images.append(str(path))
        elif path.suffix == '.html':
            if path not in instance.analysis and analysis_file not in instance.analysis:
                instance.images.append(str(path))
        elif path.suffix == '.ipynb':
            if path not in instance.analysis and analysis_file not in instance.analysis:
                instance.analysis.append(str(path))
        elif path.suffix == '.json':
            if path not in instance.stored_params and analysis_file not in instance.stored_params:
                instance.stored_params.append(str(path))

    instance_copy = create_path_entity_copy(instance)
    instance_copy.to_TOML(data_path)

    return make_response("Analysis files added", 201)


def toggle_star(data_loc: str):
    """
    Toggles the star tag of an instance.This changes both the parameter in the folder containing the instance as well as the TOML file.

    :param data_loc: A path containing the instance. This can be either the path to the TOML file, the data file or the folder containing the data file.
    """

    data_path = Path(data_loc)
    if data_path.name == 'data.ddh5':
        instance_path = data_path.parent.joinpath(data_path.parent.name + '.toml')
    elif data_path.is_dir():
        instance_path = data_path.joinpath(data_path.name + '.toml')
    elif data_path.suffix == '.toml':
        instance_path = data_path
    else:
        abort(404, f"Data with path {data_path} not found")

    if not instance_path.is_file():
        abort(404, f"Instance with path {instance_path} not found")

    # FIXME: there definitely is a more efficient way to do this.
    if str(instance_path) not in PATH_TO_UUID_INDEX or PATH_TO_UUID_INDEX[str(instance_path)] not in INDEX:
        abort(404, f"Instance with path {instance_path} not found")

    instance = INDEX[PATH_TO_UUID_INDEX[str(instance_path)]]
    star_path = instance_path.parent.joinpath('__star__.tag')

    if star_path.is_file():
        star_path.unlink()
        if "star" in instance.tags:
            instance.tags.remove("star")
            instance_copy = create_path_entity_copy(instance)
            instance_copy.to_TOML(instance_path)
    else:
        star_path.touch()
        if "star" not in instance.tags:
            instance.tags.append("star")
            instance_copy = create_path_entity_copy(instance)
            instance_copy.to_TOML(instance_path)

    return make_response("Star toggled", 201)


def get_buckets():
    """
    API function that returns a dictionary of all the buckets
    :return: json with keys being the ID of the bucket and the value its name.
    """
    ret = {}
    for k, v in INDEX.items():
        if isinstance(v, Bucket):
            ret[k] = v.name
    return ret, 201


def get_stored_params(ID):
    """
    Assuming all of the stored parameters are stored in JSON file for now but more complex types can be added.
    """

    def convert_inf_to_string(data):
        """
        fit parameters in json sometimes store inf as a float, this function converts them to string
        """
        if isinstance(data, dict):
            for key, value in data.items():
                if isinstance(value, float):
                    if value == float('inf'):
                        data[key] = "Infinity"
                    elif value == float('-inf'):
                        data[key] = "-Infinity"
                else:
                    convert_inf_to_string(value)
        elif isinstance(data, list):
            for index, item in enumerate(data):
                if isinstance(item, float):
                    if item == float('inf'):
                        data[index] = "Infinity"
                    elif item == float('-inf'):
                        data[index] = "-Infinity"
                else:
                    convert_inf_to_string(item)
        return data

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]

    if not isinstance(ent, Instance):
        abort(400, f"Entity with ID {ID} is not an instance")

    if ent.stored_params is None:
        return json.dumps({}), 201

    ret = {}
    for json_path in ent.stored_params:
        path = Path(json_path)
        if path.suffix == '.json':
            with path.open() as json_file:
                data = json.load(json_file)
                ret[path.stem] = data

    return json.dumps(convert_inf_to_string(ret)), 201


def get_fake_mentions():
    """
    Api function used to send a fake list of options for testing mentions

    :return:
    """
    global counter

    fake_dict = {
        "Choose Koala": "9f8968d5-f98e-4ecf-ba37-3a1c84f9da7a",
        "Choose Panda": "23f07cfe-8f82-4294-a9a5-03241ad47194",
        "Named The Koala": "cca50dad-add7-4ea5-b452-d59eb3edb16d",
    }

    return json.dumps(fake_dict), 201


def toggle_bookmark(ID):
    """
    API function that toggles the bookmark of an entity

    :param ID: The ID of the entity to toggle the bookmark
    """
    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]
    ent.toggle_bookmark()

    # Convert uuids in the entity to paths and saves the change
    path_copy = create_path_entity_copy(ent)
    path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))

    return make_response("Bookmark toggled", 201)


reset()

# Converters need to be defined at the bottom so they access the indices after they have been instantiated
# Instantiates the HTML to Markdon converter object
html_to_markdown = MyMarkdownConverter(uuid_index=UUID_TO_PATH_INDEX)


markdown_to_html = md = markdown.Markdown(extensions=[CustomLinkExtension(uuid_index=UUID_TO_PATH_INDEX,
                                                                          instance_index=INSTANCEIMAGE),
                                                      TableExtension(use_align_attribute=True),
                                                      CustomHeadlessTableExtension()])
