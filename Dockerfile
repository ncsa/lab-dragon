FROM python:3.11.7-slim

RUN apt-get update && apt-get upgrade --yes
RUN yes | apt-get install git

RUN useradd --create-home backend-server
USER backend-server
WORKDIR /home/backend-server

ENV VIRTUALENV=/home/backend-server/venv
RUN python3 -m venv $VIRTUALENV
ENV PATH="$VIRTUALENV/bin:$PATH"

COPY --chown=backend-server requirements.txt ./
RUN pip install -r requirements.txt

COPY --chown=backend-server . ./qdata-mockup


RUN echo ls
RUN pip install uvicorn
RUN pip install -e ./qdata-mockup

CMD uvicorn 'qdata.api.starting_app:app'