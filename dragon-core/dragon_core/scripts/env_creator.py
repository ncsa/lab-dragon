import copy
import string
import shutil
import random
from pathlib import Path
from typing import Union, Optional

import numpy as np
from jinja2 import Environment, FileSystemLoader

# Tools from pfafflab
from labcore.measurement.sweep import sweep_parameter
from labcore.measurement.record import record_as
from labcore.measurement.storage import run_and_save_sweep
from labcore.data.datadict_storage import load_as_xr
# Needed to generate hvplot from a script
import hvplot.xarray
import hvplot as hv

from dragon_core.components.table import Table
from dragon_core.generators.meta import read_from_TOML
from dragon_core.scripts.add_toml_to_data_dir import add_toml_to_data
from dragon_core.generators.meta import generate_all_classes, delete_all_modules


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
def create_simple_test_env(target: Optional[Union[Path, str]] = None, create_md: bool = True, light_delete=False) -> None:
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

    env_creator_path = Path(__file__)

    from dragon_core.generators.display import generate_md
    from dragon_core.modules.project import Project
    from dragon_core.modules.task import Task
    from dragon_core.modules.step import Step

    top_project = Project(name="Testing Project",
                          description="This is the top most parent project.",
                          user='testUser',
                          comments=['This is the over arching project. '
                                    '\nThis project is going to have 2 subprojects focusing on pandas and koalas '
                                    'in which I create a fake environment to start testing things'], )

    top_project_path = Path(path, f"{top_project.ID[:8]}_Testing Project.toml").resolve()
    to_be_created.append((top_project, top_project_path))

    testing_table_panda = Table(panda_types=["cute", "fuzzy", "black and white"], panda_colors=["black", "white", "purple"], panda_size=["small", "medium", "large"])

    panda_project = Project(name="Testing Pandas",
                            description="This is the pandas project.",
                            user='testUser',
                            parent=top_project_path,
                            comments=['This project is about pandas, we will get a panda online a qualify the panda'] #, testing_table_panda]
                            )
    panda_project_path = Path(path, f"{panda_project.ID[:8]}_Testing Pandas.toml").resolve()
    to_be_created.append((panda_project, panda_project_path))

    testing_table_koala = Table(koala_types=["cute", "chubby", "creepy"], koala_colors=["black", "white", "purple"], koala_size=["small", "medium", "large"])

    koala_project = Project(name="Testing Koalas",
                            description="This is the koalas project.",
                            user='testUser',
                            parent=top_project_path,
                            comments=['This project is about koalas, we will get a koala online a qualify the koala',] #testing_table_koala]
                            )
    koala_project_path = Path(path, f"{koala_project.ID[:8]}_Testing Koalas.toml").resolve()
    to_be_created.append((koala_project, koala_project_path))

    top_project.add_child(panda_project_path)
    top_project.add_child(koala_project_path)

    get_panda_task = Task(name="Get Panda",
                          description="Task representing a look for information about pandas",
                          user='testUser',
                          comments=['I wonder what pandas images I can find online',
                                    "we want to find pandas because they are very cute"],
                          parent=panda_project_path,
                          )
    get_panda_path = Path(path, f"{get_panda_task.ID[:8]}_Get Panda.toml").resolve()
    to_be_created.append((get_panda_task, get_panda_path))

    panda_project.add_child(get_panda_path)

    look_for_panda_images_step = Step(name="Look For Panda Images",
                                      description='I am going to go to google to look for panda images',
                                      user='testUser',
                                      comments=['Wow there are a lot of panda images online'],
                                      parent=get_panda_path, )
    look_for_panda_images_path = Path(path, f"{look_for_panda_images_step.ID[:8]}_Look For Panda Images.toml").resolve()
    to_be_created.append((look_for_panda_images_step, look_for_panda_images_path))

    get_panda_task.add_child(look_for_panda_images_path)

    found_pandas_step = Step(name="Found Pandas",
                             description="I have found a lot of panda images here are a few that I found",
                             user='testUser2',
                             parent=get_panda_path, )
    found_pandas_path = Path(path, f"{found_pandas_step.ID[:8]}_Found Pandas.toml").resolve()
    found_pandas_step.add_comment(f"Here is the first panda I found online: ![giant_panda]({env_creator_path.parent.parent.parent.joinpath('test', 'testing_images', 'pandas' ,'Giant_panda.jpg')}) \n\n This one is really big!")
    found_pandas_step.add_comment(f"Here are some other ones: ![baby_pandas]({env_creator_path.parent.parent.parent.joinpath('test', 'testing_images', 'pandas', 'baby_pandas.png')}) \n\n These ones are really cute!")
    found_pandas_step.add_comment(f"Here is another one: ![panda_eating]({env_creator_path.parent.parent.parent.joinpath('test', 'testing_images', 'pandas', 'panda_eating.png')}) \n\n omg look at this one eat")

    to_be_created.append((found_pandas_step, found_pandas_path))

    get_panda_task.add_child(found_pandas_path)

    choose_panda_step = Step(name="Choose Panda",
                             description="I am going to choose a panda to use for my project",
                             user='testUser2',
                             comments=[
                                 'They are all so cute, this is a difficult choice. I think I will choose this one:',
                                 f'![giant_panda]({env_creator_path.parent.parent.parent.joinpath("test", "testing_images", "pandas", "Giant_panda.jpg")})'],
                             parent=get_panda_path, )
    choose_panda_path = Path(path, f"{choose_panda_step.ID[:8]}_Choose Panda.toml").resolve()
    to_be_created.append((choose_panda_step, choose_panda_path))

    get_panda_task.add_child(choose_panda_path)

    name_panda_step = Step(name="Named The Panda",
                           description="you can't have a panda with no name",
                           user='testUser2',
                           parent=panda_project_path,
                           comments=["The panda will be named Homer"]
                           )
    name_panda_path = Path(path, f"{name_panda_step.ID[:8]}_Named Panda.toml").resolve()
    to_be_created.append((name_panda_step, name_panda_path))

    panda_project.add_child(name_panda_path)

    get_koala_task = Task(name="Get Koala",
                          description="Task representing a look for information about Koalas",
                          user='testUser3',
                          comments=['I wonder what Koalas images I can find online',
                                    "we want to find Koalas because they are very cute"],
                          parent=koala_project_path,
                          )
    get_koala_path = Path(path, f"{get_koala_task.ID[:8]}_Get Koala.toml").resolve()
    to_be_created.append((get_koala_task, get_koala_path))

    koala_project.add_child(get_koala_path)

    look_for_koala_images_step = Step(name="Look For Koala Images",
                                      description='I am going to go to google to look for koala images',
                                      user='testUser',
                                      comments=['Wow there are a lot of koala images online'],
                                      parent=get_koala_path, )
    look_for_koala_images_path = Path(path, f"{look_for_koala_images_step.ID[:8]}_Look For Koala Images.toml").resolve()
    to_be_created.append((look_for_koala_images_step, look_for_koala_images_path))

    get_koala_task.add_child(look_for_koala_images_path)

    found_koalas_step = Step(name="Found Koalas",
                             description="I have found a lot of koala images here are a few that I found",
                             user='testUser3',
                             parent=get_koala_path, )
    found_koalas_path = Path(path, f"{found_koalas_step.ID[:8]}_Found Koalas.toml").resolve()
    found_koalas_step.add_comment(f"Here is the first koala I found online: ![creepy_koala]({env_creator_path.parent.parent.parent.joinpath('test', 'testing_images', 'koalas', 'creepy_koala.jpg')}) \n\n This one is freakishly creepy!")
    found_koalas_step.add_comment(f"Here are some other ones: ![baby_koala]({env_creator_path.parent.parent.parent.joinpath('test', 'testing_images', 'koalas', 'baby_koala.png')}) \n\n These ones are really cute!")
    found_koalas_step.add_comment(f"Here is another one: ![sleepy_koala]({env_creator_path.parent.parent.parent.joinpath('test', 'testing_images', 'koalas', 'sleepy_koala.png')}) \n\n omg look at this one sleep")

    to_be_created.append((found_koalas_step, found_koalas_path))

    get_koala_task.add_child(found_koalas_path)

    choose_koala_step = Step(name="Choose Koala",
                             description="I am going to choose a koala to use for my project",
                             user='testUser3',
                             comments=[
                                 'They are all so cute, this is a difficult choice. I think I will choose this one:',
                                 f'![creepy_koala]({env_creator_path.parent.parent.parent.joinpath("test", "testing_images", "koalas", "creepy_koala.jpg")})'],
                             parent=get_koala_path, )
    choose_koala_path = Path(path, f"{choose_koala_step.ID[:8]}_Choose Koala.toml").resolve()
    to_be_created.append((choose_koala_step, choose_koala_path))

    get_koala_task.add_child(choose_koala_path)

    name_koala_step = Step(name="Named The Koala",
                           description="you can't have a koala with no name",
                           user='testUser3',
                           parent=koala_project_path,
                           comments=["The koala will be named Bart"]
                           )
    name_koala_path = Path(path, f"{name_koala_step.ID[:8]}_Named Koala.toml").resolve()
    to_be_created.append((name_koala_step, name_koala_path))

    koala_project.add_child(name_koala_path)

    # Loop through all items to be created and save them to TOML files
    for item, item_path in to_be_created:
        item.to_TOML(item_path)
        if create_md:
            generate_md(item_path, path)

    path.joinpath("resource").mkdir(exist_ok=True)
    return top_project_path.parent.joinpath(top_project.ID[:8] + '_' + "Testing Project.toml")

# FIXME: What exactly does the request param do?
def create_test_env_with_msmts(request=False, tmp_path=Path(r'./tmp').resolve(), n_measurements=1, generate_each_run=False):

    if hasattr(request, 'param'):
        tmp_path = request.param
    if tmp_path.is_dir() and generate_each_run:
        shutil.rmtree(tmp_path)
        tmp_path.mkdir()

    folder_path = tmp_path.joinpath('data')
    # If the data folder exists, don't generate anything to not rewrite data
    if folder_path.is_dir():
        return None

    script_path = Path(__file__)

    msmt_names = ["test_through",
                  "pulsed_resonator_spec",
                  "qA_power_rabi",
                  "qB_power_rabi",
                  "qA_T1",
                  "qB_T1",
                  "qA_T2_echo",
                  "qB_T2_echo",
                  "ssb_spec_pi",
                  "no_star",
                  ]

    images = [f"monkeys/monkey-{i}.png" for i in range(1, 14)]

    inner_sweep = sweep_parameter('x', np.linspace(-10, 10), record_as(lambda x, y: x*2 + y*2, 'z'))
    outer_sweep = sweep_parameter('y', np.linspace(-10, 10))

    my_sweep = outer_sweep @ inner_sweep

    env = Environment(loader=FileSystemLoader(script_path.parent.parent.parent.joinpath("test", "testing_templates")),
                      extensions=['jinja2.ext.do'], )
    template = env.get_template('jupyter_notebook.jinja')

    folder_path.mkdir()

    image_copy = copy.deepcopy(images)
    for name in msmt_names:
        for i in range(n_measurements):
            test_params = {f'param{j}': ''.join(random.choices(string.ascii_letters + string.digits, k=5)) for j
                           in range(1, 11)}
            path, data = run_and_save_sweep(sweep=my_sweep,
                                            data_dir=folder_path,
                                            name=name, test_parameters=test_params)

            image = random.choice(image_copy)
            shutil.copy(script_path.parent.parent.parent.joinpath('test', 'testing_images', image), path)
            image_copy.pop(image_copy.index(image))

            xr_data = load_as_xr(folder=path)
            plot = xr_data.hvplot()
            hv.save(plot, path.joinpath('plot.html'))

            if i == 0 and name != 'no_star':
                star_path = path.joinpath('__star__.tag')
                star_path.touch()
            with open(path.joinpath('jupyter_notebook.ipynb'), 'w') as f:
                f.write(template.render(data=data))

    bucket_path = add_toml_to_data(folder_path)
    root_path = create_simple_test_env(tmp_path, create_md=False, light_delete=True)
    ent = read_from_TOML(root_path)

    ent.data_buckets.append(str(bucket_path))
    ent.to_TOML(root_path)
    return root_path


if __name__ == "__main__":

    new_notebook_location = Path(r"/Users/marcosf2/Documents/github/dragon-core-mockup/test/env_generator")
    jupyter_book_root_path = Path("../../test/env_generator/Testing Project.toml")
    jupyter_book_target_path = Path("../../test/env_generator/jupyterbook/")

    # create_simple_test_env(target=new_notebook_location, create_md=False)
    create_test_env_with_msmts(tmp_path=new_notebook_location, n_measurements=1, generate_each_run=True)

    # generate_book(jupyter_book_root_path, jupyter_book_target_path)