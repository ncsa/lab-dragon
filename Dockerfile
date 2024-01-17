FROM python:3.11.7-slim

RUN apt-get update && apt-get upgrade --yes
RUN yes | apt-get install git

RUN useradd --create-home pfafflab
USER pfafflab
WORKDIR /home/pfafflab

ENV VIRTUALENV=/home/pfafflab/venv
RUN python3 -m venv $VIRTUALENV
ENV PATH="$VIRTUALENV/bin:$PATH"

EXPOSE 8000

COPY --chown=pfafflab requirements.txt ./
RUN pip install -r requirements.txt

COPY --chown=pfafflab . ./qdata-mockup


RUN pip install uvicorn
RUN pip install -e ./qdata-mockup

WORKDIR /home/pfafflab/qdata-mockup

CMD uvicorn 'qdata.api.starting_app:app' --host 0.0.0.0 --forwarded-allow-ips '*'