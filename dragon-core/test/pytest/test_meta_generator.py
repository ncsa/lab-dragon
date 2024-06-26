"""
When you are creating new classes that have mandatory fields you need to specify a default value in your tests. It is
"""
import os
import string
import random
import importlib
from pathlib import Path

import tomllib as toml

import dragon_core
import dragon_core.modules
from dragon_core.generators.meta import read_from_TOML
from dragon_core.components import Table


def generate_random_string(length):
    characters = string.ascii_lowercase + string.digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


def get_toml_module_and_class(item):
    toml_path = dragon_core.SCHEMASDIR.joinpath(f'{item}.toml')

    with open(str(toml_path), 'rb') as f:
        toml_doc = toml.load(f)

    module = importlib.import_module(f'dragon_core.modules.{item}')
    cls = item[0].upper() + item[1:]
    _class = getattr(module, cls)

    return toml_doc, _class


def test_all_fields_in_generated_class(module_names):
    classes = module_names

    user = 'testUser'
    for cls in classes:

        toml_doc, _class = get_toml_module_and_class(cls)

        # user is a mandatory field in all entities
        instance = _class(user=user)
        for field in toml_doc['definitions']:
            assert hasattr(instance, field)


def test_re_instantiation_of_classes(module_names):

    classes = module_names
    user = 'testUser'

    for cls in classes:
        toml_doc, _class = get_toml_module_and_class(cls)

        fields = {'name': generate_random_string(5)}
        # Generate random content for the fields that need it. Skip the automatically generated ones.
        for field in toml_doc['definitions']:
            if 'time' in field:
                continue
            elif 'ID' in field:
                continue
            elif 'link' in field:
                continue
            elif ('List[str]' in toml_doc['definitions'][field] or
                  'List[Union[Comment, Table, str]]' in toml_doc['definitions'][field]):
                comments = []
                for x in range(5):
                    comments.append(generate_random_string(5))
                # Testing tables
                test_table = Table(column1=['hello', 'this'], column2=['is', 'a'], column3=['test', 'table'])
                comments.append(test_table)

                fields[field] = comments
            elif 'str' in toml_doc['definitions'][field]:
                fields[field] = generate_random_string(8)
        if user not in fields:
            fields['user'] = user
        instance = _class(**fields)
        toml_path = Path(os.getcwd()).joinpath(fields['name'] + '.toml')
        instance.to_TOML(toml_path)
        retrieved_instance = read_from_TOML(toml_path)
        toml_path.unlink(missing_ok=True)

        assert instance == retrieved_instance


def test_handling_directories_in_comments():
    ent_toml, ent = get_toml_module_and_class('entity')

    fields = {'name': generate_random_string(5),
              'user': 'testUser',
              'comments': ["../testing_images/pandas"],}
    instance = ent(**fields)
    toml_path = Path(os.getcwd()).joinpath(fields['name'] + '.toml')
    instance.to_TOML(toml_path)
    retrieved_instance = read_from_TOML(toml_path)
    toml_path.unlink(missing_ok=True)

    assert instance.comments == retrieved_instance.comments
    assert len(retrieved_instance.comments) == 3


def test_adding_non_existent_field():

    ent_toml, ent = get_toml_module_and_class('entity')
    pr_toml, pr = get_toml_module_and_class('project')

    try:
        entity = ent(random=1234)
    except TypeError:
        assert True

    try:
        project = pr(random=1234)
    except TypeError:
        assert True
        return

    assert False


