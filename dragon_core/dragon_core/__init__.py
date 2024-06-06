import os
from pathlib import Path

DRAGONDIR = Path(os.path.split(os.path.abspath(__file__))[0])

SCHEMASDIR = DRAGONDIR.joinpath("../schemas")  # This should be a configuration option

APISCHEMAS = DRAGONDIR.joinpath("api/schemas")  # This should be a configuration option

MODULESDIR = DRAGONDIR.joinpath("modules")  # This should be a configuration option

TEMPLATESDIR = DRAGONDIR.joinpath("../templates")  # This should be a configuration option
