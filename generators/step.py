# IQUIST/NCSA
# UIUC
import argparse
import sys
from datetime import datetime
from pathlib import Path

from entity import _generate as generate_entity

__description__ = """
Generator for a step
=========================

A step reflects an atomic action that was performed by a researcher. This action can be a part of a bigger task.
Steps can also have instances attached to them to indicate that this step created data.

Contents:
* An step TOML file

"""


# Create a TOML file to instantiate the `Step` class with the default template
# Read the template
# Provide a uuid
# Write the TOML file
# Create a directory to store files using the supplied path
# Return the corresponding uuid
def generate(name,
             filename,
             process,
             parent_class,
             *args, **kwargs):
    doc = generate_entity(name=name, *args, **kwargs)

    start_time = datetime.now()
    doc["fields"]["start_time"] = start_time.isoformat()
    doc["fields"]["end_time"] = 0
    doc["fields"]["process"] = process
    doc["fields"]["parent_class"] = parent_class

    with open(filename, "w") as f:
        f.write(doc.as_string())

    return doc["fields"]["id"]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=__description__
    )

    parser.add_argument("name", help="The name of the Step")
    parser.add_argument("filename", help="The name of the file to write the Step to")
    parser.add_argument("--parent_class", default="entity", help="The parent class of the Step")
    parser.add_argument("--parent_link", default="", help="The parent link of the Step")
    parser.add_argument("--user", default="", help="The user of the Step")
    parser.add_argument("--description", default='', help="The description of the Step")
    parser.add_argument("--comments", nargs="*", default=[], help="The comments of the Step")
    parser.add_argument("--related_links", nargs="*", default=[], help="The related links of the Step")
    parser.add_argument("--params", nargs="*", default=[], help="The params of the Step")

    args = parser.parse_args()
    name = args.name
    filename = args.filename
    stored_content = args.stored_content
    version = args.version
    parent_class = args.parent_class
    parent_link = args.parent_link
    user = args.user
    description = args.description
    comments = args.comments
    related_links = args.related_links
    params = args.params

    generate(name,
             filename,
             stored_content,
             version,
             parent_class,
             parent_link=parent_link,
             user=user,
             description=description,
             comments=comments,
             related_links=related_links,
             params=params)

