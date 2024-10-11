import os
from pathlib import Path

import connexion
from dotenv import load_dotenv
from connexion.middleware import MiddlewarePosition
from starlette.middleware.cors import CORSMiddleware

# from dragon_core.scripts.env_creator import create_test_env_with_msmts
from dragon_core.scripts.new_env_creator import create_simulated_env

load_dotenv()

if os.getenv('CREATE_TESTING_ENVIRONMENT') == 'True':
    target = Path("../test/tmp")
    ret_root = create_simulated_env(target=Path(os.getenv("LAIRS_DIRECTORY")))

app = connexion.App(__name__, specification_dir='./')
app.add_middleware(
    CORSMiddleware,
    position=MiddlewarePosition.BEFORE_EXCEPTION,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_api('API_specification.yaml')

if __name__ == '__main__':
    host = os.getenv('TRAEFIK_HOST')
    app.run(host=host, port=8000)

