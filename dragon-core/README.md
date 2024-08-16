# TODO 

- [ ] Add an example.env file.
- [ ] Add an env generator script.
- [ ] Replace the link to the notebok creation guide.
- [ ] Switch to fully using pip, because swagger-ui refuses to properly install with conda.

# Dragon Core

The backend of lab dragon is built using a Connexion backend (Flask).

More information to come :)

# Quickstart

It is recommended to run this through the docker-compose file at the home of the repository, but if you want to run just the server in your local computer, follow the following instructions.

First, create a new python virtual environment from the requirements.txt file. We use conda and the conda-forge channel but you are free to use whatever tool you want. From the dragon-core folder, run the following command:

```bash
env create -f environment.yml
```

Once in the new environment you also need to manually install the swagger-ui package:

```bash
pip install 'connexion[swagger-ui]'
```

Activate the newly created virtual environment 'lab-dragon' and install it in editable mode, the dot is a placeholder for the current directory.:

```bash
pip install -e .
```

Once we have it installed we need an environment configuration file, look at the example.env 

If you don't already have a notebook, you should create a test notebook to begin playing with lab dragon. Look at INSERTLINKHERETOCREATEANOTHERNOTEBOOK for more information.

Once you have a notebook, start the server by running the module dragon_core/api/starting_app.py:

```bash
python api/starting_app.py
```

