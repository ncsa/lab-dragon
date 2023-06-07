# IQUIST/NCSA
# UIUC
import argparse
from datetime import datetime

from entity import _generate as generate_entity

__description__ = """
Generator for a task
=========================

A Task reflects a collection (can also be a single one) of steps to perform a certain action.
Because of this, Tasks have objectives. Tasks can be composed of a collection of individual steps. 


Contents:
* An step TOML file

"""
def generate(name,
             filename,
             objective,
             process,
             parent_class,
             *args, **kwargs):
    doc = generate_entity(name=name, *args, **kwargs)

    start_time = datetime.now()
    doc["fields"]["start_time"] = start_time.isoformat()
    doc["fields"]["end_time"] = 0
    doc["fields"]["objective"] = objective
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
    parser.add_argument("--objective", default="", help="The objective of the Step")
    parser.add_argument("--process", default="", help="The process of the Step")
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
    objective = args.objective
    process = args.process
    parent_class = args.parent_class
    parent_link = args.parent_link
    user = args.user
    description = args.description
    comments = args.comments
    related_links = args.related_links
    params = args.params

    generate(name,
             filename,
             objective,
             process,
             parent_class,
             parent_link=parent_link,
             user=user,
             description=description,
             comments=comments,
             related_links=related_links,
             params=params)

