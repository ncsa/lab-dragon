import re
import json
import copy
from pathlib import Path
from enum import Enum, auto
from typing import Optional, Union, Tuple

import markdown
import imagehash
from PIL import Image
from werkzeug.utils import secure_filename
from flask import abort, make_response, send_file

from qdata import HOSTADDRESS
from qdata.modules.task import Task
from qdata.modules.step import Step
from qdata.modules.entity import Entity
from qdata.modules.project import Project
from qdata.modules.instance import Instance
from qdata.generators.meta import read_from_TOML
from qdata.components.comment import SupportedCommentType, Comment
from converters import MyMarkdownConverter,  CustomLinkExtension

ROOTPATH = Path(r'/Users/marcosf2/Documents/github/qdata-mockup/test/pytest/tmp/Testing Project.toml')
# ROOTPATH = Path(r'/Users/marcosf2/Documents/github/qdata-mockup/test/env_generator/Testing Project.toml')
# ROOTPATH = Path(r'/Users/marcosf2/Documents/playground/notebook_testing/notebook_files/target/First prototype.toml')

RESOURCEPATH = Path(r'/Users/marcosf2/Documents/github/qdata-mockup/test/env_generator/resource')

# List of classes that can contain children. Only Project and Task can contain children for now.
PARENT_TYPES = ["Project", "Task"]
ALL_TYPES = {"Project": Project, "Task": Task, "Step": Step}
# Holds all of the entity types that exists in the notebook
ENTITY_TYPES = set(("Project", "Task", "Step"))

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
USERS = set()

# Instantiates the HTML to Markdon converter object
html_to_markdown = MyMarkdownConverter(uuid_index=UUID_TO_PATH_INDEX)


markdown_to_html = md = markdown.Markdown(extensions=[CustomLinkExtension(uuid_index=UUID_TO_PATH_INDEX, instance_index=INSTANCEIMAGE)])

# Domain, used to convert from links to paths, to links the web browser can understand
DOMAIN = 'http://localhost:3000'


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
    # FIXME: This is a design decision that should be checked
    elif str(IMAGEINDEX[img_hash]) != str(image_path):
        raise ValueError(f"The image {image_path} is already in the index with the path {IMAGEINDEX[img_hash]}")


def find_equivalent_image(image, threshold=5):
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
            img = Image.open(img_path)
            add_image_to_index(img, img_path)
            INSTANCEIMAGE[img_path] = instance.ID

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


def read_child_entity(entity_path: Path):

    ent = read_from_TOML(entity_path)

    add_ent_to_index(ent, entity_path)

    # Add the user to the user index
    USERS.add(ent.user)

    child_list = []
    if len(ent.children) > 0:
        for child in ent.children:
            child_list.append(read_child_entity(child))

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
            val.parent = PATH_TO_UUID_INDEX[str(path)]

        # Update the children of the parent
        for child in val.children:
            path = Path(child)
            if path.is_file():
                val.children[val.children.index(child)] = PATH_TO_UUID_INDEX[str(path)]

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

        ent_copy = copy.deepcopy(ent)
        for comment in ent_copy.comments:
            if comment.com_type[-1] == SupportedCommentType.md.value or comment.com_type[-1] == SupportedCommentType.string.value:
                replaced_path = comment_path_to_uuid(comment.content[-1])
                html_comment = markdown_to_html.convert(replaced_path)
                comment.content[-1] = html_comment

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


def add_comment(ID, comment, username: Optional[str] = None, HTML: bool = False):
    """
    Adds a comment to the indicated entity. It does not handle images or tables yet.

    :param ID: The id of the entity the comment should be added to.
    :param comment: The text of the comment itself.
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
        content = html_to_markdown.convert(comment['content'])
    else:
        content = comment['content']

    ent.add_comment(content, username)

    # After adding the comment update the file location
    ent_path = Path(UUID_TO_PATH_INDEX[ID])
    copy_ent = create_path_entity_copy(ent)
    copy_ent.to_TOML(ent_path)

    return make_response("Comment added", 201)


# TODO: Commments don't yet accept any other username.
def edit_comment(ID, commentID, comment, username: Optional[str] = None, HTML: bool = False):

    if ID not in INDEX:
        abort(404, f"Entity with ID {ID} not found")

    ent = INDEX[ID]

    if HTML:
        comment = html_to_markdown.convert(comment)

    try:
        ret = ent.modify_comment(commentID, comment, username)
        if ret:
            # Convert uuids in the entity to paths
            path_copy = create_path_entity_copy(ent)
            path_copy.to_TOML(Path(UUID_TO_PATH_INDEX[ID]))
            return make_response("Comment edited successfully", 201)
    except ValueError as e:
        abort(400, str(e))

    return abort(400, "Something went wrong, try again")


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

    cls = ALL_TYPES[body['type']]
    ent = cls(name=body['name'], parent=body['parent'], user=body['user'])
    parent = INDEX[body['parent']]
    parent_path = Path(UUID_TO_PATH_INDEX[parent.ID])
    ent_path = parent_path.parent.joinpath(ent.name + '.toml')

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


def add_image(body, image):
    """
    Adds an image to the notebook. Checks if the image already exists in the system. if it doesn't, copy the image into
    resource.

    :param body: Text of the tag being added. usually empty
    :param image: The image you get from the flask call.
    """
    converted_image = Image.open(image.stream)
    image_path = find_equivalent_image(converted_image)

    if image_path is None:
        # Save the image to the RESOURCEPATH
        filename = secure_filename(image.filename)
        image_path = RESOURCEPATH / filename
        converted_image.save(image_path)
        add_image_to_index(Image.open(image_path), image_path)

    image_url = f"{HOSTADDRESS}properties/image/{str(image_path).replace('/', '%23')}"

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
def get_data_suggestions(ID, query="", num_matches=10):
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
        pattern = re.compile(query)
        for p, uuid in bucket.path_to_uuid.items():
            if len(matches) >= num_matches:
                break
            path = Path(p)
            instance = INDEX[uuid]
            if 'star' in instance.tags:
                if query == "" or query is None:
                    matches[path.stem] = uuid
                else:
                    if pattern.search(path.stem):
                        matches[path.stem] = uuid

    return json.dumps(matches), 201


def get_stored_params(ID):
    """
    Assuming all of the stored parameters are stored in JSON file for now but more complex types can be added.
    """

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

    return json.dumps(ret), 201


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


read_all()


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