# IQUIST/NCSA
# UIUC
import argparse
import sys
from datetime import datetime
from pathlib import Path

from entity import _generate as generate_entity

__description__ = """
Generator for an instance
=========================


An instance reflects the existence of allocated storage for experimental files
that also contain a TOML file which indicates how these files relate to each other
and their parent element.

Contents:
* An instance TOML file
* Contents

Assumptions:
* `stored_content` indicates the location of a directory where files will remain
"""


# Create a TOML file to instantiate the `Instance` class with the default template
# Read the template
# Provide a uuid
# Write the TOML file
# Create a directory to store files using the supplied path
# Return the corresponding uuid
def generate(name,
             filename,
             stored_content,
             version,
             *args, **kwargs):

    doc = generate_entity(name = name, *args, **kwargs)

    start_time = datetime.now()
    doc["fields"]["start_time"] = start_time.isoformat()
    doc["fields"]["end_time"] = 0
    doc["fields"]["version"] = version

    content_path = Path(stored_content)
    file_list = []

    if content_path.is_file():
        file_list.append(str(content_path))
    elif content_path.is_dir():
        for file_path in content_path.rglob("*"):
            if file_path.is_file():
                file_list.append(str(file_path))
    doc["fields"]["stored_content"] = file_list

    with open(filename, "w") as f:
        f.write(doc.as_string())

    return doc["fields"]["id"]

if __name__ == "__main__":

    parser = argparse.ArgumentParser(
        description=__description__
    )

    parser.add_argument("name", help="The name of the instance")
    parser.add_argument("filename", help="The name of the file to write the instance to")
    parser.add_argument("stored_content", help="The path to the stored content")
    parser.add_argument("--version", default=0, help="The version of the instance")
    parser.add_argument("--parent_link", default="", help="The parent link of the instance")
    parser.add_argument("--user", default="", help="The user of the instance")
    parser.add_argument("--description", default='', help="The description of the instance")
    parser.add_argument("--comments", nargs="*", default=[], help="The comments of the instance")
    parser.add_argument("--related_links", nargs="*", default=[], help="The related links of the instance")
    parser.add_argument("--params", nargs="*", default=[], help="The params of the instance")

    args = parser.parse_args()
    name = args.name
    filename = args.filename
    stored_content = args.stored_content
    version = args.version
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
                parent_link = parent_link,
                user = user,
                description = description,
                comments = comments,
                related_links = related_links,
                params = params)
    
