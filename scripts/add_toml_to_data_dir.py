from pathlib import Path

from labcore.data.datadict_storage import datadict_from_hdf5

from qdata.modules.instance import Instance
from qdata.modules.data_bucket import DataBucket

# Folder containing the data directory
ROOTDIR = Path("/Users/marcosf2/Documents/playground/notebook_testing/ChocolateAndVanillaCoherence/Measurements")
USER = "Michael Mollenhauer"


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


def add_toml_to_data(dir):
    delete_toml_files(dir)

    # Create the data bucket
    bucket = DataBucket(name="Measurements",
                        user=USER)
    bucket_path = dir.joinpath(bucket.name + '.toml')

    counter = 0
    for path in dir.rglob('*'):
        if path.suffix == '.ddh5':
            parent = path.parent
            if any(child.suffix == '.toml' for child in parent.iterdir()):
                continue
            else:
                # Read the data
                data_structure = {}

                try:
                    dd = datadict_from_hdf5(str(path), structure_only=True)
                    for name, value in dd.data_items():
                        full_name = name
                        if len(value["axes"]) > 0:
                            full_name += f"[{', '.join(value['axes'])}]"
                        if value["unit"] != "":
                            full_name += f"[{value['unit']}]"

                        data_structure[full_name] = value["__shape__"]
                except Exception as e:
                    print(f'Error reading {path.name} {e}')

                # Get tags, stored params and images
                tags = []
                stored_params = []
                images = []
                for file in parent.iterdir():
                    if file.suffix == ".tag":
                        # remove the leading and ending '__'
                        tags.append(file.stem[2:-2])
                    # Assuming that any param for now its stored in a JSON file
                    elif file.suffix == ".json":
                        stored_params.append(str(file))
                    elif file.suffix == ".png" or file.suffix == ".jpg":
                        images.append(str(file))

                # Create the instance
                instance = Instance(name=parent.name,
                                    user=USER,
                                    parent=bucket_path,
                                    data_structure=data_structure,
                                    tags=tags,
                                    data=[str(path)],
                                    stored_params=stored_params,
                                    images=images)

                # Save the instance
                instance.to_TOML(parent)

                bucket.add_instance(parent.joinpath(instance.name, '.toml'), instance.ID)
                counter += 1

    print(f'Done creating {counter} TOML files')
    # Save the bucket
    bucket.to_TOML(bucket_path)
    print(f'bucket created all done')


if __name__ == "__main__":

    add_toml_to_data(ROOTDIR)
