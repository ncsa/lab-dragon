"""
Module containing helpful functions that don't really fit anywhere else
"""
from pathlib import Path
from datetime import datetime, timezone


def create_timestamp() -> str:
    """
    Creates a timestamp in ISO 8601 format.

    :return: Timestamp in ISO 8601 format.
    """
    timestamp = datetime.now(timezone.utc).astimezone().isoformat()
    return timestamp


def delete_directory_contents(directory_path: Path, delete_only_toml: bool = False) -> None:
    """
    Deletes all files and subdirectories in a directory. if delete_only_toml is True, will only delete toml files in the
    same directory.

    :param directory_path: All the files and subdirectories of this path will be deleted (not the path itself)
    :param delete_only_toml: If True, it will only delete toml files. False by default.
    """
    # Create a Path object from the directory path
    directory = Path(directory_path)

    # Iterate over all files and subdirectories in the directory
    for item in directory.glob('*'):
        if delete_only_toml:
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
