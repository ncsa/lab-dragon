import uuid
import tomlkit

from pathlib import Path
from typing import List, Tuple, Dict, Optional, Union
from dragon_core.modules.entity import Entity as Entity

from dragon_core.utils import create_timestamp
from dragon_core.components import Comment, SupportedCommentType, Table


class Project(Entity):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def to_TOML(self, path: Optional[Union[str,Path]] = None):

        if hasattr(super(), 'to_TOML'):
            doc = super().to_TOML()
            vals = doc[self.name]
        else:
            doc = tomlkit.document()
            vals = tomlkit.table()

        vals['type'] = self.__class__.__name__
        
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

    def __str__(self):
        return str(self.to_TOML())

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.__dict__ == other.__dict__
        return False
