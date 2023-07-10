

from qdata.generators.jupyterbook import create_relation_dict

from ..env_creator import create_full_test_env


def md_path_creator(dir_path, filename):
    return dir_path.joinpath(filename).with_suffix(".md")


def toml_path_creator(dir_path, filename):
    return dir_path.joinpath(filename).with_suffix(".toml")


# FIXME: Figure out why it is so finicky with the file types.
def test_correctly_creating_dict(tmp_path):

    testing_project_toml = toml_path_creator(tmp_path, "Testing Project.toml")
    create_full_test_env(tmp_path, True)

    testing_project = md_path_creator(tmp_path, "Testing Project.toml")
    testing_pandas = md_path_creator(tmp_path, "Testing Pandas.toml")
    testing_koalas = md_path_creator(tmp_path, "Testing Koalas.toml")
    get_panda = md_path_creator(tmp_path, "Get Panda.toml")
    get_koala = md_path_creator(tmp_path, "Get Koala.toml")
    look_for_panda = md_path_creator(tmp_path, "Look For Panda Images.toml")
    look_for_koala = md_path_creator(tmp_path, "Look For Koala Images.toml")
    found_pandas = md_path_creator(tmp_path, "Found Pandas.toml")
    found_koalas = md_path_creator(tmp_path, "Found Koalas.toml")
    choose_panda = md_path_creator(tmp_path, "Choose Panda.toml")
    choose_koala = md_path_creator(tmp_path, "Choose Koala.toml")
    named_panda = md_path_creator(tmp_path, "Named Panda.toml")
    named_koala = md_path_creator(tmp_path, "Named Koala.toml")

    correct_dict = {
        testing_project: {
            testing_pandas: {
                get_panda: {
                    look_for_panda: None,
                    found_pandas: None,
                    choose_panda: None},
                named_panda: None},
            testing_koalas: {
                get_koala: {
                    look_for_koala: None,
                    found_koalas: None,
                    choose_koala: None},
                named_koala: None}},
    }

    created_dict = create_relation_dict(testing_project_toml, tmp_path)

    assert created_dict == correct_dict







