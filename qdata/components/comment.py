import json
import uuid
from datetime import datetime
from enum import Enum, auto
from pathlib import Path
from typing import Union
from typing import Tuple

from ..generators.meta import create_timestamp


class SupportedCommentType(Enum):

    md = 1
    string = 2
    dir = 3
    jpg = 4
    png = 5

    @classmethod
    def classify(cls, item: Union[Path, str]) -> int:
        if len(item) > 256:
            return SupportedCommentType.string.value

        item = Path(item)
        ext = item.suffix
        try:
            return cls[ext[1:]].value
        except KeyError as e:
            # if there is a KeyError it means it cannot find the extension so the comment is not treated as a file.
            pass
        if item.is_dir():
            return SupportedCommentType.dir.value
        else:
            return SupportedCommentType.string.value


class Comment:
    def __init__(self, content: Union[str, Path], user: str, **kwargs):
        if len(kwargs) != 0:
            self.ID = kwargs['ID']
            self.user = user
            self.created = kwargs['created']
            self.deleted = kwargs['deleted']
            self.content = content
            self.dates = kwargs['dates']
            self.authors = kwargs['authors']
            self.com_type = kwargs['com_type']

        else:
            self.ID = str(uuid.uuid4())
            self.user = user
            time = create_timestamp()
            self.created = time
            self.deleted = False
            self.content = [str(content)]
            self.dates = [time]
            self.authors = [user]
            self.com_type = [SupportedCommentType.classify(content)]

    def modify(self, content: Union[str, Path], user: str):
        time = create_timestamp()
        self.dates.append(time)
        self.authors.append(user)
        self.content.append(content)
        self.com_type.append(SupportedCommentType.classify(content))

    # TODO: This might be obsolete since in theory the last index should always be the latest comment.
    #  I am not fully convinced that this is the case though.
    def last_comment_index(self):
        """
        Function indicating the index of the last comment that was made.

        :return: The index indicating the position of the last comment
        """
        most_recent_index = 0
        most_recent_time = None

        dates_set = set(self.dates)

        # Since this comment object should hold a single comment, there is almost no way a comment should be edited
        # in the exact same time as it is created. This would mean that someone is trying to store multiple comments
        # in the same object instead of multiple versions.
        if len(self.dates) != len(dates_set):
            raise ValueError("There are multiple comments with the same timestamp.")

        for index, time_str in enumerate(self.dates):
            try:
                time_obj = datetime.strptime(time_str, "%Y-%m-%dT%H:%M:%S.%f%z")
                if most_recent_time is None or time_obj > most_recent_time:
                    most_recent_time = time_obj
                    most_recent_index = index
            except ValueError:
                pass  # Ignore invalid time strings

        return most_recent_index

    def last_comment(self) -> Tuple:
        """
        Function returning the last comment that was made. The return object is a tuple containing in order:
        - The last comment.
        - The numerical code indicating the type of comment (check the SupportedCommentType enum).
        - The user that made the last comment.
        - The timestamp of the last comment.

        :return: A tuple containing the last comment and the user that made it.
        """
        index = self.last_comment_index()
        return self.content[index], self.com_type[index], self.authors[index], self.dates[index]

    def __str__(self):
        ret = self.__dict__.copy()
        return json.dumps(ret, indent=4)
