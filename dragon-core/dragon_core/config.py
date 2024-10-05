"""
The following module contains all the tools we need to read and parse configuration paths
"""
import tomllib
from pathlib import Path


def verify_and_parse_config(config_path: Path) -> None:

    with open(config_path, 'rb') as f:
        c = tomllib.load(f)

    # Transcribing might be redundant, but lets me check and add defaults as needed.
    config = c['config']
    ret = {}

    if 'create_testing_environment' in config:
        ret['create_testing_environment'] = config['create_testing_environment']
    else:
        ret['create_testing_environment'] = False

    if 'notebook_root' not in config:
        raise ValueError("notebook_root not found in config file")
    ret['notebook_root'] = config['notebook_root']

    if 'lairs_directory' not in config:
        raise ValueError("dragon_lair not found in config file")
    ret['lairs_directory'] = config['lairs_directory']

    if 'resource_path' not in config:
        raise ValueError("resource_path not found in config file")
    ret['resource_path'] = config['resource_path']

    if 'users' in config:
        ret['users'] = set(config['users'])
    else:
        ret['users'] = {"Smaug", "Spyro", "Drogon", "Charizard"}

    if 'url_host' not in config:
        raise ValueError("url_host not found in config file")
    ret['url_host'] = config['url_host']

    if 'traefik_host' not in config:
        raise ValueError("traefik_host not found in config file")
    ret['traefik_host'] = config['traefik_host']

    return ret
