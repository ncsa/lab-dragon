from pathlib import Path

from qdata.generators.meta import read_from_TOML

entity_with_data_bucket = Path("tmp/Testing Pandas.toml")


def test_data_generating_fixture(refresh_modules, generate_msmt_folder_structure):
    return True


def test_empty_query(refresh_modules, generate_msmt_folder_structure):

    ent = read_from_TOML(entity_with_data_bucket)
    query = ""
    ret = ent.suggest_data()
    assert len(ret) == 9

    ret = ent.suggest_data(query=query)
    assert len(ret) == 9


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
