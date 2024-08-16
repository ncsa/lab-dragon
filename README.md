# Lab Dragon

Lab Dragon is an Electronic Lab Notebook (ELN) for scientists. It is a web application that allows you to create, edit, and share your lab notes. It is designed to be easy to use and to help you keep track of your experiments while also integrating deeply with your lab software.

## Quick Start

The easiest way to get straight into a notebook is running the docker compose file. This will run both the backend (dragon-core) and the frontend (dragon-scales).

For this we need two separate configuration files. The first is a `.env` file in the root of Lab Dragon. Please look at `example.env` for an example of what the file should look like. 
Removing the `example` from the file and running the docker-compose will generate a demo notebook with some fake data for you to explore the system. 

[!CAUTION]
When the last variable called `CREATE_TESTING_ENVIRONMENT` is set to `True`, the backend will delete all of the files in the `NOTEBOOK_ROOT` directory to create the new demo notebook.

The second config file that we need is a users file called `users.txt`. This file is picked up by the Traefik service in the docker-compose to add some basic security to the notebook until we can implement proper user management.

In the root of the project there is an example file called `example-users.txt` with the users 'guest' and 'guest2' with the encrypted password 'guest' and 'guest2'. To quickly run the notebook simply remove 'example-' from the filename To generate your own users with encrypted passwords simply run the following command in a unix environment:

```bash
echo $(htpasswd -nb <user_name> <password>) | sed -e s/\\$/\\$\\$/g
```

For example, to generate a user called 'guest' with password 'guest' you wuold run:

```bash
echo $(htpasswd -nb guest guest) | sed -e s/\\$/\\$\\$/g
```