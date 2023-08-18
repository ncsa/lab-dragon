# Assumptions and Rules

The following are the rules and assumptions that I am making as I go. 
All of them are subject to change.

## Assumptions

- All the generated classes will be placed inside the modules folder.
- At the moment you cannot add any non native schemas
- All generated classes must have a single class in the file. 
The file name should be the name of the class lowered.

## Rules

- The imports for all the files are organized in the following manner:
  - First of all the native imports.
  - Then all the imports from 3rd party dependencies
  - Lastly, all imports from this project.
- Any field that has the word `time` in the name, will be automatically timestamped
if the argument passed is `None` or `''`.
- You cannot add a key called ID, this is reserved for the entity UUID generator.
- Any Link is done by a string UUID.
- In the comment section, the user can place a string that will be displayed in the document, or a path to a file.
The supported data types are in the enum in generator.display module.
- Each comment in an entity contains metadata associated with this comment. Comments contain the following fields:
  * UUID: This indicates that a comment is located in the entity and is used to store modifications to the same comment. All versions of the same comment will have the same UUID.
  * User: This indicates who created the comment. Different versions of a comment can have different users. There is no limit as to how many users can claim a comment.
  * Timestamp: This indicates when the comment was created or modified. This is created automatically and should not be modified by the user.
  * Content: This is the actual comment, it can be a string for a simple comment or a path pointing to a md or image file.
- When creating the jupyterbook any whitespace in all of the paths involved with (the target path or any of the md files generated) will be replaced with an underscore (`_`).
This means that any whitespaces at any other point other than file names will break links.
- If you are passing as a comment a directory 
to mean that all the items inside that directory should be placed in the comments.
the directory has to be an absolute path. 
WARNING unclear what the behaviour is if the path includes other parts that are outside the network drive.