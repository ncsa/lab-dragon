

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

    correct_dict = {
        ("Testing Pandas", 1): {
            ("Get Panda", 2): {
                ("Look For Panda Images", 3): None,
                ("Found Pandas", 3): None,
                ("Choose Panda", 3): None},
            ("Named Panda", 2): None},
        ("Testing Koalas", 1): {
            ("Get Koala", 2): {
                ("Look For Koala Images", 3): None,
                ("Found Koalas", 3): None,
                ("Choose Koala", 3): None},
            ("Named Koala", 2): None}
    }

    created_dict = create_relation_dict(testing_project_toml, tmp_path)

    assert correct_dict == created_dict







