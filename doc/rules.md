# Assumptions and Rules

The following are the rules and assumptions that I am making as I go. 
All of them are subject to change.

## Assumptions

- All the generated classes will be placed inside the modules folder.
- At the moment you cannot add any non native schemas
- All generated calsses must have a single class in the file. 
The file name should be the name of the class lowered.

## Rules

- Any filed that has the word time in the name, will be automatically timestamped
if the passed argument is `None` or `''`.