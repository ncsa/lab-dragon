

# The following file has been created automatically based on a jinja template
# Anything you modify to it, will get lost when the next time the template is
# created. If you want to modify the class, please do so in the template
#
# Template has been rendered




import uuid
import tomlkit

from pathlib import Path
from typing import List, Tuple, Dict, Optional, Union
from pathlib import Path as Path
from dragon_core.modules.entity import Entity as Entity

from labcore.data.datadict_storage import datadict_from_hdf5
from dragon_core.utils import create_timestamp
from dragon_core.components import Comment, SupportedCommentType, Table



class Instance(Entity):

    
    def __init__(self,
                 version: int = 0,
                 stored_params: Union[List[Path], List[str]] = '',
                 tags: List[str] = '',
                 images: Union[List[Path], List[str]] = [],
                 data: Union[List[Path], List[str]] = [],
                 data_structure: Dict[str, Union[Tuple[int], int]] = {},
                 analysis: Union[List[Path], List[str]] = [],
                 *args, **kwargs
                 ):
        super().__init__(*args, **kwargs)
        self.version = version
        self.stored_params = stored_params
        self.tags = tags
        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(images, list) and len(images) != 0:
            self.images = images
        else:
            self.images = [].copy()
        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(data, list) and len(data) != 0:
            self.data = data
        else:
            self.data = [].copy()
        
        if isinstance(data_structure, dict) and len([x for x in data_structure.keys()]) != 0:
            self.data_structure = data_structure
        else:
            self.data_structure = dict()

        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(analysis, list) and len(analysis) != 0:
            self.analysis = analysis
        else:
            self.analysis = [].copy()
        # If you start with data, populate itself by loading values from file system.
        if len(data) != 0:
            self.populate_itself()
        

    def to_TOML(self, path: Optional[Union[str,Path]] = None):

        if hasattr(super(), 'to_TOML'):
            doc = super().to_TOML()
            vals = doc[self.name]
        else:
            doc = tomlkit.document()
            vals = tomlkit.table()

        vals['type'] = self.__class__.__name__
        vals['version'] = self.version
        
        vals['stored_params'] = self.stored_params
        
        vals['tags'] = self.tags
        
        vals['images'] = self.images
        
        vals['data'] = self.data
        
        vals['data_structure'] = self.data_structure
        
        vals['analysis'] = self.analysis
        
        
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

    
    

    
    def populate_itself(self):
        """
        Populates itself based on the files around the Instance.

        Fields that this function populates are:
        * data_structure: Loads the ddh5 file with structure only and saves the structure
        * tags: Creates a tag for every .tag file in a parent folder, removes the first and last 2 characters of the tag, usually '__'
        * stored_params: Saves the path to every .json file in a parent folder
        * images: Saves the path to every .png, .jpg, and .html file in a parent folder
        * analysis: Saves the path to every .ipynb file in a parent folder

        :param data_path: The path to the data folder.
        """
        # multiple datasets can be in the same parent folder or different.
        # Keeps track of the parent folders to avoid duplicates
        revised_parents = []
        data_structure = {}
        tags = []
        stored_params = []
        images = []
        analysis = []
        for data_path in self.data:
            parent = Path(data_path).parent
            if parent not in revised_parents:
                for file in parent.rglob('*'):
                    if file.suffix == ".ddh5":
                        try:
                            dd = datadict_from_hdf5(str(file), structure_only=True)
                            specific_data_structure = {}
                            for name, value in dd.data_items():
                                full_name = name
                                if len(value["axes"]) > 0:
                                    full_name += f"[{', '.join(value['axes'])}]"
                                if value["unit"] != "":
                                    full_name += f"[{value['unit']}]"
                                specific_data_structure[full_name] = value["__shape__"]
                            data_structure[str(file.name)] = specific_data_structure
                        except Exception as e:
                            print(f'Error reading {file.name} {e}')

                    elif file.suffix == ".tag":
                        # remove the leading and ending '__'
                        tags.append(file.stem[2:-2])
                    # Assuming that any param for now its stored in a JSON file
                    elif file.suffix == ".json":
                        stored_params.append(str(file))
                    elif file.suffix == ".png" or file.suffix == ".jpg" or file.suffix == ".html":
                        images.append(str(file))
                    elif file.suffix == ".ipynb":
                        analysis.append(str(file))

        self.data_structure = data_structure
        self.tags = tags
        self.stored_params = stored_params
        self.images = images
        self.analysis = analysis

    