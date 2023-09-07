"""
Module containing helpful functions that don't really fit anywhere else
"""
from datetime import datetime, timezone


def create_timestamp() -> str:
    """
    Creates a timestamp in ISO 8601 format.

    :return: Timestamp in ISO 8601 format.
    """
    timestamp = datetime.now(timezone.utc).astimezone().isoformat()
    return timestamp
