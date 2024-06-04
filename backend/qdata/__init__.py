import os
from pathlib import Path

QDATADIR = Path(os.path.split(os.path.abspath(__file__))[0])

SCHEMASDIR = QDATADIR.joinpath("../schemas")  # This should be a configuration option

APISCHEMAS = QDATADIR.joinpath("api/schemas")  # This should be a configuration option

MODULESDIR = QDATADIR.joinpath("modules")  # This should be a configuration option

TEMPLATESDIR = QDATADIR.joinpath("../templates")  # This should be a configuration option