
"""
This module contains all the entry points for the dragon-core package.
"""
import tomllib
import argparse
from pathlib import Path

import connexion
from connexion.resolver import MethodResolver
from connexion.middleware import MiddlewarePosition
from starlette.middleware.cors import CORSMiddleware

from dragon_core.config import verify_and_parse_config
from dragon_core.scripts.new_env_creator import create_simulated_env


def start_server(config_path: Path) -> None:
    if not config_path.exists():
        raise FileNotFoundError(f"Config file not found at {config_path}")

    config = verify_and_parse_config(config_path)

    create_testing_environment = config['create_testing_environment']
    notebook_root = config['notebook_root']
    traefik_host = config['traefik_host']

    if create_testing_environment:
        # target = Path(resource_path)
        notebook_root = create_simulated_env(target=Path(notebook_root).parent)
        config['notebook_root'] = str(notebook_root)

    app = connexion.FlaskApp(__name__, specification_dir='./')
    app.add_middleware(
        CORSMiddleware,
        position=MiddlewarePosition.BEFORE_EXCEPTION,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_api('./api/API_specification.yaml')

    with app.app.app_context():
        app.app.config['API_config'] = config

        app.run(host=traefik_host, port=8000)


def dragon_ignite_fire_sack() -> None:
    parser = argparse.ArgumentParser(description='Starting the backend server of dragon-core')
    parser.add_argument("-cp", "--config_path", type=str, help="Path to the configuration file")

    args = parser.parse_args()

    config_path = Path(args.config_path)

    start_server(config_path)


def start_debug_server() -> None:

    # Replace path to config
    config_path = Path("/Users/marcosf2/Documents/github/lab-dragon/dragon-core/config_example.toml")
    start_server(config_path)


if __name__ == '__main__':
    start_debug_server()
