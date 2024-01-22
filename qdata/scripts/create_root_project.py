import argparse
from pathlib import Path

try:
    from qdata.modules.project import Project
except ImportError as e:
    from qdata.generators.meta import generate_all_classes, delete_all_modules
    delete_all_modules()
    generate_all_classes()
    from qdata.modules.project import Project 


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Create a root project.')
    parser.add_argument('name', type=str, help='Project name')
    parser.add_argument('--user', type=str, default='Pfafflab', help='User name')
    parser.add_argument('--path', type=Path, default=Path.cwd(), help='Path to the root project. If the path is not a TOML file, it will create a toml file in the specified path with the name as its filename')

    args = parser.parse_args()

    # Access the values with args.user, args.name, args.path
    name = args.name
    user = args.user
    path = args.path

    project = Project(name=name, user=user)
    if not path.suffix == '.toml':
        path = path.joinpath(f'{name}.toml')
    
    project.to_TOML(path)
        

