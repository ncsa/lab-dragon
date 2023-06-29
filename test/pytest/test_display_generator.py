from pathlib import Path

import tomllib as toml

from qdata.generators.display import generate_md
from qdata.modules.entity import Entity


def create_entity(path):

    name = "This is a testing Entity"
    user = "panda2"
    description = "This is a testing entity and the text is used for testing purposes"
    comments = ["This is a comment", "This is another comment"]

    ent = Entity(name=name, user=user, description=description, comments=comments)
    ent.to_TOML(path)


def test_text_in_md(tmp_path):
    create_entity(tmp_path)

    source_path = Path(tmp_path.joinpath("This is a testing Entity.toml"))

    generate_md(source_path, tmp_path)

    target_path = Path(tmp_path.joinpath("This is a testing Entity.md"))
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






