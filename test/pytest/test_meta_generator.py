import os
import time
import string
import random
import importlib
from pathlib import Path

import tomllib as toml
from pprint import pprint

import qdata
import qdata.modules
from qdata.generators.meta import read_from_TOML


def generate_random_string(length):
    characters = string.ascii_lowercase + string.digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


def get_toml_module_and_class(item):
    toml_path = qdata.SCHEMASDIR.joinpath(f'{item}.toml')

    with open(str(toml_path), 'rb') as f:
        toml_doc = toml.load(f)

    module = importlib.import_module(f'qdata.modules.{item}')
    cls = item[0].upper() + item[1:]
    _class = getattr(module, cls)

    return toml_doc, _class


def test_all_fields_in_generated_class(module_names):
    classes = module_names

    for cls in classes:

        toml_doc, _class = get_toml_module_and_class(cls)

        instance = _class()
        for field in toml_doc['definitions']:
            assert hasattr(instance, field)


def test_re_instantiation_of_classes(module_names):

    classes = module_names

    for cls in classes:
        toml_doc, _class = get_toml_module_and_class(cls)

        fields = {'name': generate_random_string(5)}
        for field in toml_doc['definitions']:
            if 'time' in field:
                continue
            elif 'ID' in field:
                continue
            elif 'link' in field:
                continue
            elif 'List[str]' in toml_doc['definitions'][field]:
                comments = []
                for x in range(5):
                    comments.append(generate_random_string(5))
                fields[field] = comments
            elif 'str' in toml_doc['definitions'][field]:
                fields[field] = generate_random_string(8)

        instance = _class(**fields)
        toml_path = Path(os.getcwd()).joinpath(fields['name'] + '.toml')
        instance.to_TOML(toml_path)
        retrieved_instance = read_from_TOML(toml_path)
        toml_path.unlink(missing_ok=True)

        assert instance == retrieved_instance


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


