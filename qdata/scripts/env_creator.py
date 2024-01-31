from pathlib import Path
from typing import Union, Optional

from qdata.components.table import Table
from qdata.generators.meta import generate_all_classes
from qdata.generators.jupyterbook import generate_book


def delete_directory_contents(directory_path, light_delete=False):
    """
    Deletes all files and subdirectories in a directory. if light_delete is True, will only delete toml files in the
    same directory

    :param directory_path:
    :param light_delete:
    :return:
    """
    # Create a Path object from the directory path
    directory = Path(directory_path)

    # Iterate over all files and subdirectories in the directory
    for item in directory.glob('*'):
        if light_delete:
            if item.is_file() and item.suffix == '.toml':
                # Delete file
                item.unlink()
        else:
            if item.is_file():
                # Delete file
                item.unlink()
            else:
                # Recursively delete subdirectory and its contents
                delete_directory_contents(item)
                # Delete empty subdirectory
                item.rmdir()


# TODO: When we have a better plan for how to handle the instance object, add the images into the instance object.
def create_full_test_env(target: Optional[Union[Path, str]] = None, create_md: bool = True, light_delete=False) -> None:
    """
    Creates a standard notebook used for testing in the target path.

    :param target: The location of the testing notebook. If this is None, it will create it in the env_generator
     folder inside the testing folder of this project.
    :param create_md: If True, it will also create the md representation of the TOML files. Defaults, to True.
    :param light_delete: If True, will only delete toml files in the same directory. Defaults to False.
    """
    self_path = Path(__file__)
    if target is None:
        path = self_path.parent.joinpath("env_generator")
    else:
        path = Path(target)

    delete_directory_contents(path, light_delete)

    generate_all_classes()
    to_be_created = []

    from qdata.generators.display import generate_md
    from qdata.modules.project import Project
    from qdata.modules.task import Task
    from qdata.modules.step import Step

    top_project = Project(name="Testing Project",
                          description="This is the top most parent project.",
                          user='testUser',
                          comments=['This is the over arching project. '
                                    '\nThis project is going to have 2 subprojects focusing on pandas and koalas '
                                    'in which I create a fake environment to start testing things'], )

    top_project_path = Path(path, "Testing Project.toml").resolve()
    to_be_created.append((top_project, top_project_path))

    testing_table_panda = Table(panda_types=["cute", "fuzzy", "black and white"], panda_colors=["black", "white", "purple"], panda_size=["small", "medium", "large"])

    panda_project = Project(name="Testing Pandas",
                            description="This is the pandas project.",
                            user='testUser',
                            parent=top_project_path,
                            comments=['This project is about pandas, we will get a panda online a qualify the panda', testing_table_panda]
                            )
    panda_project_path = Path(path, "Testing Pandas.toml").resolve()
    to_be_created.append((panda_project, panda_project_path))

    testing_table_koala = Table(koala_types=["cute", "chubby", "creepy"], koala_colors=["black", "white", "purple"], koala_size=["small", "medium", "large"])

    koala_project = Project(name="Testing Koalas",
                            description="This is the koalas project.",
                            user='testUser',
                            parent=top_project_path,
                            comments=['This project is about koalas, we will get a koala online a qualify the koala', testing_table_koala]
                            )
    koala_project_path = Path(path, "Testing Koalas.toml").resolve()
    to_be_created.append((koala_project, koala_project_path))

    top_project.add_child(panda_project_path)
    top_project.add_child(koala_project_path)

    get_panda_task = Task(name="Get Panda",
                          description="Task representing a look for information about pandas",
                          user='testUser',
                          comments=['I wonder what pandas images I can find online',
                                    "we want to find pandas because they are very cute"],
                          parent=panda_project_path,
                          objective="Find a panda online",
                          )
    get_panda_path = Path(path, "Get Panda.toml").resolve()
    to_be_created.append((get_panda_task, get_panda_path))

    panda_project.add_child(get_panda_path)

    look_for_panda_images_step = Step(name="Look For Panda Images",
                                      description='I am going to go to google to look for panda images',
                                      user='testUser',
                                      comments=['Wow there are a lot of panda images online'],
                                      parent=get_panda_path, )
    look_for_panda_images_path = Path(path, "Look For Panda Images.toml").resolve()
    to_be_created.append((look_for_panda_images_step, look_for_panda_images_path))

    get_panda_task.add_child(look_for_panda_images_path)

    found_pandas_step = Step(name="Found Pandas",
                             description="I have found a lot of panda images here are a few that I found",
                             user='testUser2',
                             parent=get_panda_path, )
    found_pandas_path = Path(path, "Found Pandas.toml").resolve()
    found_pandas_step.add_comment("Here is the first panda I found online: ![giant_panda](/Users/marcosf2/Documents/github/qdata-mockup/test/testing_images/pandas/Giant_panda.jpg) \n\n This one is really big!")
    found_pandas_step.add_comment("Here are some other ones: ![baby_pandas](/Users/marcosf2/Documents/github/qdata-mockup/test/testing_images/pandas/baby_pandas.png) \n\n These ones are really cute!")
    found_pandas_step.add_comment("Here is another one: ![panda_eating](/Users/marcosf2/Documents/github/qdata-mockup/test/testing_images/pandas/panda_eating.png) \n\n omg look at this one eat")
    to_be_created.append((found_pandas_step, found_pandas_path))

    get_panda_task.add_child(found_pandas_path)

    choose_panda_step = Step(name="Choose Panda",
                             description="I am going to choose a panda to use for my project",
                             user='testUser2',
                             comments=[
                                 'They are all so cute, this is a difficult choice. I think I will choose this one:',
                                 str(self_path.parent.joinpath("testing_images", "pandas", "Giant_panda.jpg"))],
                             parent=get_panda_path, )
    choose_panda_path = Path(path, "Choose Panda.toml").resolve()
    to_be_created.append((choose_panda_step, choose_panda_path))

    get_panda_task.add_child(choose_panda_path)

    name_panda_step = Step(name="Named The Panda",
                           description="you can't have a panda with no name",
                           user='testUser2',
                           parent=panda_project_path,
                           comments=["The panda will be named Homer"]
                           )
    name_panda_path = Path(path, "Named Panda.toml").resolve()
    to_be_created.append((name_panda_step, name_panda_path))

    panda_project.add_child(name_panda_path)

    get_koala_task = Task(name="Get Koala",
                          description="Task representing a look for information about Koalas",
                          user='testUser3',
                          comments=['I wonder what Koalas images I can find online',
                                    "we want to find Koalas because they are very cute"],
                          parent=koala_project_path,
                          objective="Find a Koala online",
                          )
    get_koala_path = Path(path, "Get Koala.toml").resolve()
    to_be_created.append((get_koala_task, get_koala_path))

    koala_project.add_child(get_koala_path)

    look_for_koala_images_step = Step(name="Look For Koala Images",
                                      description='I am going to go to google to look for koala images',
                                      user='testUser',
                                      comments=['Wow there are a lot of koala images online'],
                                      parent=get_koala_path, )
    look_for_koala_images_path = Path(path, "Look For Koala Images.toml").resolve()
    to_be_created.append((look_for_koala_images_step, look_for_koala_images_path))

    get_koala_task.add_child(look_for_koala_images_path)

    found_koalas_step = Step(name="Found Koalas",
                             description="I have found a lot of koala images here are a few that I found",
                             user='testUser3',
                             comments=[str(self_path.parent.joinpath("testing_images", "koalas"))],
                             parent=get_koala_path, )
    found_koalas_path = Path(path, "Found Koalas.toml").resolve()
    to_be_created.append((found_koalas_step, found_koalas_path))

    get_koala_task.add_child(found_koalas_path)

    choose_koala_step = Step(name="Choose Koala",
                             description="I am going to choose a koala to use for my project",
                             user='testUser3',
                             comments=[
                                 'They are all so cute, this is a difficult choice. I think I will choose this one:',
                                 str(self_path.parent.joinpath("testing_images", "koalas", "creepy_koala.jpg"))],
                             parent=get_koala_path, )
    choose_koala_path = Path(path, "Choose Koala.toml").resolve()
    to_be_created.append((choose_koala_step, choose_koala_path))

    get_koala_task.add_child(choose_koala_path)

    name_koala_step = Step(name="Named The Koala",
                           description="you can't have a koala with no name",
                           user='testUser3',
                           parent=koala_project_path,
                           comments=["The koala will be named Bart"]
                           )
    name_koala_path = Path(path, "Named Koala.toml").resolve()
    to_be_created.append((name_koala_step, name_koala_path))

    koala_project.add_child(name_koala_path)
    for i, p in to_be_created:
        i.to_TOML(p)
        if create_md:
            generate_md(p, path)

    path.joinpath("resource").mkdir(exist_ok=True)


if __name__ == "__main__":

    new_notebook_location = Path(r"/Users/marcosf2/Documents/github/qdata-mockup/test/env_generator")
    jupyter_book_root_path = Path("../../test/env_generator/Testing Project.toml")
    jupyter_book_target_path = Path("../../test/env_generator/jupyterbook/")

    create_full_test_env(target=new_notebook_location, create_md=False)
    # generate_book(jupyter_book_root_path, jupyter_book_target_path)