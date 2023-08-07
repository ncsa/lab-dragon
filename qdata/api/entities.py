from pathlib import Path
from pprint import pprint

from qdata.modules.task import Task
from qdata.modules.step import Step
from qdata.modules.project import Project
from qdata.modules.instance import Instance
from qdata.generators.meta import read_from_TOML

ROOTPATH = Path(r'/Users/marcosf2/Documents/github/qdata-mockup/test/env_generator/Testing_Project.toml')


def read_child_entity(entity_path: Path):

    ent = read_from_TOML(entity_path)

    child_dict = {}
    if len(ent.children) > 0:
        for child in ent.children:
            child_dict.update(read_child_entity(child))

    ret_dict = {ent.ID: {'name': ent.name,
                         'type': ent.__class__.__name__,
                         'children': child_dict,
                         }}

    return ret_dict


def read_all():
    """
    Function that reads all the entities and return a dictionary with nested entities
    :return:
    """
    return read_child_entity(ROOTPATH)







