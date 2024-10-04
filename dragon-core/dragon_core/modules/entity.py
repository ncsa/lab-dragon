import uuid
import tomlkit

from pathlib import Path
from typing import List, Tuple, Dict, Optional, Union

from dragon_core.utils import create_timestamp
from dragon_core.components import Comment, SupportedCommentType, Table


class Entity(object):
    # If True, checks everytime the entity is saved to_TOML if the filename starts with the first 8 digits of the ID.
    # If it doesn't it adds them.
    START_FILENAME_WITH_ID = True
    
    def __init__(self,
                 user: str,
                 ID: Optional[str] = None,
                 name: str = '',
                 previous_names: List[str] = [],
                 parent: Union[str, Path] = '',
                 deleted: bool = False,
                 description: str = '',
                 comments: List[Union[Comment, Table, str]] = [],
                 children: List[Union[str, Path]] = [],
                 params: List[Tuple[str]] = [],
                 data_buckets: List[Union[str, Path]] = [],
                 bookmarked: bool = False,
                 start_time: str = None,
                 end_time: str = None,
                 ):
        self.user = user
        if ID is None or ID == '':
            self.ID = str(uuid.uuid4())
        else:
            self.ID = ID

        if name is None or name == '':
            self.name = self.ID
        else:
            self.name = name

        if previous_names is None or previous_names == '':
            self.previous_names = self.ID
        else:
            self.previous_names = previous_names

        self.parent = parent
        self.deleted = deleted
        self.description = description
        if isinstance(comments, list) and len(comments) != 0:
            self.comments = []
            for com in comments:
                self.add_comment(com)
        else:
            self.comments = [].copy()

        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(children, list) and len(children) != 0:
            self.children = children
        else:
            self.children = [].copy()
        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(params, list) and len(params) != 0:
            self.params = params
        else:
            self.params = [].copy()
        # If we don't save a copy of the list,
        #   python ends up assigning the same object in memory to every Entity instance.
        if isinstance(data_buckets, list) and len(data_buckets) != 0:
            self.data_buckets = data_buckets
        else:
            self.data_buckets = [].copy()
        self.bookmarked = bookmarked
        if start_time is None or start_time == '':
            self.start_time = create_timestamp()
        else:
            self.start_time = start_time

        if end_time is None or end_time == '':
            self.end_time = create_timestamp()
        else:
            self.end_time = end_time

    def to_TOML(self, path: Optional[Union[str,Path]] = None):
        if hasattr(super(), 'to_TOML'):
            doc = super().to_TOML()
            vals = doc[self.name]
        else:
            doc = tomlkit.document()
            vals = tomlkit.table()

        vals['type'] = self.__class__.__name__
        vals['user'] = self.user
        vals['ID'] = self.ID
        
        vals['name'] = self.name
        
        vals['previous_names'] = self.previous_names
        
        vals['parent'] = str(self.parent)
        
        vals['deleted'] = self.deleted
        
        vals['description'] = self.description
        
        # Same as children, we want to save the str version of every comment, not the object.
        vals['comments'] = [str(comment) for comment in self.comments]
        
        # We want to save the str version of every child, not the object.
        vals['children'] = [str(child) for child in self.children]
        
        vals['params'] = self.params
        
        vals['data_buckets'] = self.data_buckets
        
        vals['bookmarked'] = self.bookmarked
        
        vals['start_time'] = self.start_time
        
        vals['end_time'] = self.end_time
        
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
    
    def add_child(self, child):
        if not hasattr(self, 'children'):
            self.children = []
        self.children.append(child)

    def add_comment(self, comment: Union[str, Comment, Table, List[Table], List[Comment], List[str]],
                    user: Optional[str] = None) -> None:
        """
        Add a comment to the entity. If a directory is passed, this function will go through the directory and add a
        comment to every supported file in it in alphabetical order. It will **NOT** go through subdirectories.
        Whenever it iterates through a list (either if it is passed a list or goes through all of the files in a
        directory) it will call itself to add individual comments.

        :param comment: If passed a string to indicate the comment, it will create a new `Comment` object with that
            string as the comment. If its passed a list of strings, it will create a new comment for each of those strings.
            If passed a `Comment` object, it will add that comment to the entity. If passed a list of `Comment` objects,
            it will add each of those comments to the entity.
        :param user: The user that is adding the comment.
            If not passed, it will default to the use who created this entity.
        """

        # Function inside function because its very specific to adding comments and should not be called from
        # anywhere else
        def add_directory(path: Path) -> None:
            files = [file for file in path.iterdir() if file.is_file()]
            supported_items = SupportedCommentType.__members__.keys()
            for file in sorted(files):
                if file.is_dir():
                    continue
                if file.suffix[1:] in supported_items:
                    self.add_comment(Comment(file, user))
                else:
                    continue

        if user is None:
            user = self.user

        if isinstance(comment, list):
            for com in comment:
                if isinstance(com, Comment):
                    self.comments.append(com)
                else:
                    self.add_comment(com, user)
        else:
            if isinstance(comment, Comment):
                self.comments.append(comment)
            elif isinstance(comment, str):
                try:
                    path = Path(comment)
                    if path.is_dir():
                        add_directory(path)
                    else:
                        self.comments.append(Comment(comment, user))
                # Comment may be too long to convert to path
                except OSError:
                    self.comments.append(Comment(comment, user))
            elif isinstance(comment, Table):
                self.comments.append(Comment(comment, user))
            else:
                raise TypeError(f"Comment must be a string, Table object, or a Comment object, not {type(comment)}")

    def modify_comment(self, comment_id, content, user=None):

        comment = None
        for com in self.comments:
            if com.ID == comment_id:
                comment = com
                break
        if comment is None:
            raise ValueError(f"Comment with id {comment_id} does not exist.")

        if user is None:
            user = comment.authors[-1]

        comment.modify(content=content, user=user)
        return True

    def suggest_data(self, query: str = "", min_threshold=5) -> List[str]:
        """
        Function used to suggest Instances based on a passed query.
        This function will go to any data bucket attached to this or any parent entity,
        ask all the data buckets associated with them and
        return any Instances that are starred and pass a regex match with the query.
        If no query is passed, it will return all starred Instances.

        :param query: The query to find Instances with.
        :param min_threshold: The minimum number of matches an Instance must have for the search to not
            go to parent data buckets.
        """

        def search_parents(parent, inner_matches):
            if parent is None:
                return inner_matches
            for bucket in parent.data_buckets:
                inner_matches.add(bucket.suggest_data(query))
            if len(inner_matches) < min_threshold:
                return search_parents(parent.parent, inner_matches)
            return inner_matches


        matches = set()
        for bucket in self.data_buckets:
            matches.add(bucket.suggest_data(query))

        if len(matches) < min_threshold:
            matches = search_parents(self.parent, matches)

        return matches

    def toggle_bookmark(self):
        """
        Changes the value in the bookmark field to the opposite of what it currently is.
        """
        self.bookmarked = not self.bookmarked

    def change_name(self, new_name: str):
        """
        Changes the name of the entity to the new name passed.
        """
        self.previous_names.append(self.name)
        self.name = new_name
    
