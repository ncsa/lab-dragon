from pathlib import Path

import pytest

from qdata.generators.meta import read_from_TOML

entity_with_data_bucket = Path("/Users/marcosf2/Documents/github/qdata-mockup/test/pytest/tmp/Testing Pandas.toml")


def get_entity_id(path=entity_with_data_bucket):
    return read_from_TOML(path).ID


@pytest.mark.parametrize("generate_msmt_folder_structure", [Path("/Users/marcosf2/Documents/github/qdata-mockup/test/pytest/docker")], indirect=True)
def test_basic_generation(refresh_modules, generate_msmt_folder_structure):
    return True


def test_data_generating_fixture(refresh_modules, client):
    id = get_entity_id()
    ret = client.get(f"api/entities/{id}")
    assert ret.status_code == 201


def test_empty_query(refresh_modules, generate_msmt_folder_structure, client):

    ent = read_from_TOML(entity_with_data_bucket)
    ID = ent.ID
    query = ""
    ret_no_query = client.get(f"api/entities/{ID}/dataSuggestions")
    assert len(ret_no_query) == 9

    ret = client.get(f"api/entities/{ID}/dataSuggestions?query={query}")
    assert len(ret) == 9
    assert ret == ret_no_query

def test_specific_query(refresh_modules, generate_msmt_folder_structure):

    ent = read_from_TOML(entity_with_data_bucket)
    query = "qA_T1"
    ret = ent.suggest_data(query=query)
    assert len(ret) == 1


def test_multiple_results_query(refresh_modules, generate_msmt_folder_structure):

    ent = read_from_TOML(entity_with_data_bucket)
    query = "qA"
    ret = ent.suggest_data(query=query)
    assert len(ret) == 3


def test_look_for_no_star_msmt(refresh_modules, generate_msmt_folder_structure):

    ent = read_from_TOML(entity_with_data_bucket)
    query = "no_star"
    ret = ent.suggest_data(query=query)
    assert len(ret) == 0


def test_getting_query_from_child_entity(refresh_modules, generate_msmt_folder_structure):

    child_ent = Path("/tmp/Choose Panda.toml")

    query = ""
    ret = child_ent.suggest_data(query=query)
    assert len(ret) == 9

    query = "qA_T1"
    ret = child_ent.suggest_data(query=query)
    assert len(ret) == 1

    query = "qA"
    ret = child_ent.suggest_data(query=query)
    assert len(ret) == 3

    query = "no_star"
    ret = child_ent.suggest_data(query=query)
    assert len(ret) == 0
