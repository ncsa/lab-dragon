"""
This entity is simply a data bucket that groups all instances in a single place.
The customization of this entity is still to be determined, so for now I will be hard-coding it and committing it.
"""
from pathlib import Path
from typing import Optional, Union

import tomlkit

from .entity import Entity


class DataBucket(Entity):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.path_to_uuid = {}
        self.uuid_to_path = {}

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
            with open(path, 'w') as f:
                f.write(doc.as_string())

        return doc


