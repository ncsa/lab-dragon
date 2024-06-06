

from dragon_core.generators.jupyterbook import create_relation_dict

from dragon_core.scripts.env_creator import create_simple_test_env


def md_path_creator(dir_path, filename):
    return dir_path.joinpath(filename).with_suffix(".md")


def toml_path_creator(dir_path, filename):
    return dir_path.joinpath(filename).with_suffix(".toml")


# FIXME: Figure out why it is so finicky with the file types.
def test_correctly_creating_dict(tmp_path):

    testing_project_toml = toml_path_creator(tmp_path, "Testing Project.toml")
    create_simple_test_env(tmp_path, True)

    correct_dict = {
        ("Testing_Pandas", 1): {
            ("Get_Panda", 2): {
                ("Look_For_Panda_Images", 3): None,
                ("Found_Pandas", 3): None,
                ("Choose_Panda", 3): None},
            ("Named_Panda", 2): None},
        ("Testing_Koalas", 1): {
            ("Get_Koala", 2): {
                ("Look_For_Koala_Images", 3): None,
                ("Found_Koalas", 3): None,
                ("Choose_Koala", 3): None},
            ("Named_Koala", 2): None}
    }

    created_dict = create_relation_dict(testing_project_toml, tmp_path, tmp_path)

    assert correct_dict == created_dict







