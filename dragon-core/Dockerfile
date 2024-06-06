FROM python:3.11.7-slim

RUN apt-get update && apt-get upgrade --yes
RUN yes | apt-get install git
RUN apt-get update -y && apt-get install -y gcc
RUN apt install libhdf5-dev --yes
RUN apt install libhdf5-serial-dev
RUN apt-get install -y pkg-config 

RUN useradd --create-home pfafflab
USER pfafflab
WORKDIR /home/pfafflab

ENV VIRTUALENV=/home/pfafflab/venv
RUN python3 -m venv $VIRTUALENV
ENV PATH="$VIRTUALENV/bin:$PATH"

EXPOSE 8000

COPY --chown=pfafflab requirements.txt ./
RUN pip install --upgrade pip setuptools wheel
RUN pip install -r requirements.txt

COPY --chown=pfafflab . ./lab-dragon


RUN pip install uvicorn
RUN pip install -e ./lab-dragon

WORKDIR /home/pfafflab/lab-dragon

CMD uvicorn 'dragon-core.api.starting_app:app' --host 0.0.0.0 --forwarded-allow-ips '*'