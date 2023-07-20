from pathlib import Path

import tomllib as toml

from qdata.generators.display import generate_md
from qdata.modules.entity import Entity
from qdata.modules.task import Task


def create_entity(path):

    name = "This is a testing Entity"
    user = "panda2"
    description = "This is a testing entity and the text is used for testing purposes"
    comments = ["This is a comment", "This is another comment"]

    ent = Entity(name=name, user=user, description=description, comments=comments)
    ent.to_TOML(path)


def create_task(path):

    name = "This is a testing Task"
    user = "panda2"
    description = "This is a testing task and the text is used for testing purposes"
    comments = ["This is a comment", "This is another comment"]
    objective = "Make sure that we are testing the task correctly"

    task = Task(name=name, user=user, description=description, comments=comments, objective=objective)
    task.to_TOML(path)


def check_vals(source_path, target_path, tmp_path):
    generate_md(source_path, tmp_path)

    assert target_path.exists()

    with open(source_path, 'rb') as f:
        source = toml.load(f)

    with open(target_path, 'r') as f:
        target = f.read()

    source = source[[x for x in source.keys()][0]]
    for key, val in source.items():
        if key == 'Comments':
            for com in val:
                assert com in target
        elif key == 'name':
            assert '# ' + val in target
        elif key == 'ID':
            assert 'ID: ' + val in target
        elif key == 'parent_link':
            assert 'Parent: ' + val in target
        elif key == 'parent_class':
            continue
        elif val != "" and isinstance(val, str):
            assert val in target


def test_entity_in_md(tmp_path):
    create_entity(tmp_path)

    source_path = Path(tmp_path.joinpath("This is a testing Entity.toml"))
    target_path = Path(tmp_path.joinpath("This is a testing Entity.md"))

    check_vals(source_path, target_path, tmp_path)


def test_task_in_md(tmp_path):
    """
    Worth having an identical test for a task, because it is expanding on the base template of Entity and we are testing
    inheritance for both the renderer and the templates.
    """

    create_task(tmp_path)

    source_path = Path(tmp_path.joinpath("This is a testing Task.toml"))
    target_path = Path(tmp_path.joinpath("This is a testing Task.md"))

    check_vals(source_path, target_path, tmp_path)
