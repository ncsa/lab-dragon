"""
This entity is simply a data bucket that groups all instances in a single place.
The customization of this entity is still to be determined, so for now I will be hard-coding it and committing it.
"""
import re
from pathlib import Path
from typing import Optional, Union

import tomlkit

from .entity import Entity
from qdata.generators.meta import read_from_TOML


class Bucket(Entity):
    """
    Stands for data_bucket, entity needs to be called the same name as the module for the code to work.

    """

    def __init__(self,path_to_uuid={}, uuid_to_path={}, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if len(path_to_uuid) == 0:
            self.path_to_uuid = {}.copy()
        else:
            self.path_to_uuid = path_to_uuid

        if len(uuid_to_path) == 0 and len(self.path_to_uuid) != 0:
            self.uuid_to_path = {v: k for k, v in self.path_to_uuid.items()}
        else:
            self.uuid_to_path = uuid_to_path

    def add_instance(self, instance_path, uuid):
        self.path_to_uuid[instance_path] = uuid
        self.uuid_to_path[uuid] = instance_path

    def get_instance_path(self, uuid):
        return self.uuid_to_path[uuid]

    def get_instance_uuid(self, instance_path):
        return self.path_to_uuid[instance_path]

    def to_TOML(self, path: Optional[Union[str, Path]] = None):

        if hasattr(super(), 'to_TOML'):
            doc = super().to_TOML()
            vals = doc[self.name]
        else:
            doc = tomlkit.document()
            vals = tomlkit.table()

        vals['type'] = self.__class__.__name__

        # convert the index into a serializable format
        keys = [str(k) for k in self.path_to_uuid.keys()]
        values = [str(v) for v in self.path_to_uuid.values()]
        vals['path_to_uuid'] = dict(zip(keys, values))

        doc[self.name] = vals

        if path is not None:
            path = Path(path)
            if path.is_dir():
                path = path.joinpath(self.name + '.toml')
            if self.START_FILENAME_WITH_ID and not path.name.startswith(self.ID[:8] + '_'):
                path = path.parent.joinpath(self.ID[:8] + '_' + path.name)
            with open(path, 'w') as f:
                f.write(doc.as_string())

        return doc

    def suggest_data(self, query: str = "", min_threshold: int = 5):
        matched_paths = {}
        pattern = re.compile(query)
        for path, uuid in self.path_to_uuid.items():
            if pattern.search(path.name):
                matched_paths[path] = uuid
                entity = read_from_TOML(path)
                print(entity)
        return matched_paths
