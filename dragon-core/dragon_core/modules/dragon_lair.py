import uuid
from typing import List
from pathlib import Path
from dataclasses import dataclass

from tomlkit import document, comment, table, dump, load

from .library import Library
from dragon_core.utils import create_timestamp


@dataclass
class DragonLibrary:
    name: str
    ID: str
    deleted: bool
    path: Path
    instance: Library


class DragonLair:
    """
    A dragon lair is the central place of the whole system. This is where we keep track of all of the libraries and
    their notebooks. This is represented in a special TOML file that is structured in the following way:

    ```
    ["config"]

    config fields go here ...

    ["Libraries"]
    library1 = "path/to/library1"
    library2 = "path/to/library2"
    ```

    Loading the libraries is handled in the following way:
    * Entities instantiate the lair.
    * As part of the instantiation from file, the lair creates all the DragonLibrary instances. NOTE: the libraries entities themselves are not yet instantiated.
    * Entities instantiate the Libraries themselves.
    * Entities loads the entities by calling the insert_instance method.

    """

    _FILENAME: str = '_dragon_lair.toml'

    def __init__(self, dir_path: Path):

        self._intro_warning = ('COMPUTER MANAGED FILE, PLEASE DO NOT EDIT MANUALLY \n# This is the central management '
                               'file for the Lab Dragon system')

        # The path of the directory where the lair is stored. If this is not there, it is assumed it is a fresh system.
        self.dir_path = dir_path

        self.ID = None
        self.creation_timestamp = None
        self.modified_timestamps = None

        self.libraries: List[DragonLibrary] = []

        # loads itself from file.
        if not self.dir_path.exists():
            raise FileNotFoundError(f"cannot start Lab Dragon, lair's directory not found at {self.dir_path}")

        # If the file is not there, create it.
        self.file_path = self.dir_path.joinpath(self._FILENAME)

        if not self.file_path.exists():
            self.start_fresh_lair()
        else:
            self.load_from_file()

    def start_fresh_lair(self):

        doc = document()

        doc.add(comment(self._intro_warning))

        meta = table()
        ID = str(uuid.uuid4())
        meta['ID'] = ID
        meta['creation_timestamp'] = create_timestamp()
        meta['modified_timestamps'] = [create_timestamp()]
        doc.add("meta", meta)

        if not self.file_path.exists():
            self.file_path.touch()
        else:
            raise FileExistsError(f'directory {self.file_path} already exists, cannot create lair')

        with open(self.file_path, 'w') as f:
            dump(doc, f)

        self.ID = ID
        self.creation_timestamp = meta['creation_timestamp']
        self.modified_timestamps = meta['modified_timestamps']

    def load_from_file(self):

        if not self.file_path.exists():
            raise FileNotFoundError(f"cannot start Lab Dragon, lair's file not found at {self.file_path}")

        with open(self.file_path, 'rb') as f:
            t = load(f)

        for tab_name, tab in t.items():
            if tab_name == 'meta':
                self.ID = tab['ID']
                self.creation_timestamp = tab['creation_timestamp']
                self.modified_timestamps = tab['modified_timestamps']
            else:
                self.libraries.append(DragonLibrary(name=tab['name'],
                                                    ID=tab['ID'],
                                                    deleted=tab['deleted'],
                                                    path=tab['path'],
                                                    instance=None))

    def insert_instance(self, instance: Library):
        for lib in self.libraries:
            if lib.ID == instance.ID:
                lib.instance = instance
                break
        self.to_file()

    def add_library(self, lib: Library, lib_path: Path):
        if lib.name in self.libraries:
            raise ValueError(f"Library with name {lib.name} already exists in the lair")

        self.libraries.append(DragonLibrary(name=lib.name,
                                            ID=lib.ID,
                                            deleted=False,
                                            path=lib_path,
                                            instance=lib))
        self.to_file()

    def delete_library(self, lib_name: str):
        if lib_name not in self.libraries:
            raise ValueError(f"Library with name {lib_name} does not exist in the lair")

        for lib in self.libraries:
            if lib.name == lib_name:
                lib.deleted = True
                break

        self.to_file()

    def to_file(self):

        doc = document()
        doc.add(comment(self._intro_warning))

        meta = table()
        meta['ID'] = self.ID
        meta['creation_timestamp'] = self.creation_timestamp
        self.modified_timestamps.append(create_timestamp())  # Add another modification timestamp
        meta['modified_timestamps'] = self.modified_timestamps
        doc.add("meta", meta)

        for library in self.libraries:
            tab = table()
            tab['name'] = library.name
            tab['ID'] = library.ID
            tab['deleted'] = library.deleted
            tab['path'] = str(library.path)
            doc.add(library.name, tab)

        with open(self.file_path, 'w') as f:
            dump(doc, f)






