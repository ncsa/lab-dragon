"""
Goes through an entire measurement directory and creates TOML files for each measurement.
Also creates the new DataBucket for this measurement folder.

Assumes that html files are images and that ipynb files are analysis notebooks.
"""

from pathlib import Path

from labcore.data.datadict_storage import datadict_from_hdf5

from qdata.modules.instance import Instance
from qdata.modules.bucket import Bucket


def delete_toml_files(directory):
    print(f'Deleting all TOML files in {directory}...')
    counter = 0
    for file in Path(directory).rglob('*.toml'):
        file.unlink()
        counter += 1
    print(f'Deleted {counter} TOML files')


def count_toml_files(directory):
    print(f'Counting all TOML files in {directory}...')
    counter = 0
    for file in Path(directory).rglob('*.toml'):
        counter += 1
    return counter


def add_toml_to_data(dir, user="testUser"):
    delete_toml_files(dir)

    # Create the data bucket
    bucket = Bucket(name="Measurements",
                        user=user)
    bucket_path = dir.joinpath(bucket.name + '.toml')

    counter = 0
    for path in dir.rglob('*'):
        if path.suffix == '.ddh5':
            parent = path.parent
            # If there already is a toml file present in this directory, skip this one
            if any(child.suffix == '.toml' for child in parent.iterdir()):
                continue
            instance = Instance(name=parent.name,
                                user=user,
                                parent=bucket_path,
                                data=[str(path)],)
            # Save the instance
            instance.to_TOML(parent)

            bucket.add_instance(parent.joinpath(instance.name + '.toml'), instance.ID)
            counter += 1

    print(f'Done creating {counter} TOML files')
    # Save the bucket
    bucket.to_TOML(bucket_path)
    print(f'bucket created all done')
