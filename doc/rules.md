# Assumptions and Rules

The following are the rules and assumptions that I am making as I go. 
All of them are subject to change.

## Assumptions

- All the generated classes will be placed inside the modules folder.
- At the moment you cannot add any non native schemas
- All generated classes must have a single class in the file. 
The file name should be the name of the class lowered.
- All comments in an entity should be unique. You can have the same comment in different entities but if you have 2 
identical comments in the same entity they will not be shown.
- all data folders that contain a jupyternotebook are assumed to be used for analysis and will be added to the generated instance.

## Rules

- The imports for all the files are organized in the following manner:
  - First of all the native imports.
  - Then all the imports from 3rd party dependencies
  - Lastly, all imports from this project.
- Any field that has the word `time` in the name, will be automatically timestamped
if the argument passed is `None` or `''`.
- You cannot add a key called ID, this is reserved for the entity UUID generator.
- In the comment section, the user can place a string that will be displayed in the document, or a path to a file.
The supported data types are in the enum in generator.display module.
- Each comment in an entity contains metadata associated with this comment. Comments contain the following fields:
  * UUID: This indicates that a comment is located in the entity and is used to store modifications to the same comment. All versions of the same comment will have the same UUID.
  * User: This indicates who created the comment. Different versions of a comment can have different users. There is no limit as to how many users can claim a comment.
  * Timestamp: This indicates when the comment was created or modified. This is created automatically and should not be modified by the user.
  * Content: This is the actual comment, it can be a string for a simple comment or a path pointing to a md or image file.
- When creating the jupyterbook any whitespace in all of the paths involved with (the target path or any of the md files generated) will be replaced with an underscore (`_`).
This means that any whitespaces at any other point other than file names will break links.
- When passing a directory as a comment:
  * The path must be an absolute path.
  * When creating the comment, the entity will detect that is a path and create a new comment for each file that is in the directory.
  * This is **NOT** recursive, so if there are subdirectories, they will be ignored.
  * TOML files containing entities cannot have directories as comments. they must have explicit comments to all wanted files.
- **DO NOT** add comments directly to the entity. This will break the entity and the entity will not be able to be loaded. use add comment method instead
WARNING unclear what the behaviour is if the path includes other parts that are outside the network drive.
- A comment cannot end with an extension of a supported file type.
- Because of how images are handled, there cannot be `%23` in an image path

### Initial draft of how images are handled.

**WARNING** At the moment this is just a draft and is not implemented.

- An image can be either a whole comment or more likely it can be part of a comment.
- internally, all images are placed in an index where the server can access them.
- The path of that image is the identifier, and when the user or client requests the url with that path, the server will return the image. Because `/` is used in the entry point, they are replaced by `%23` in the path.
- To refer to an image in a comment, a path to the image must placed in a markdown link format. If the path points to the image bucket, the server will know it is being linked to a specific image.
- When an image is placed in the notebook, it will be compared to every other image in the notebook. If it finds a close enough image in the notebook, it will instead create a link to it instead of adding a copy.
- Currently, the entity in memory as well as in the TOML file, do not keep track of how many images or links they have inside, they simply have the comments. This instead is calculated in the server on demand. This is done to have a single source of truth at the expense of repeated calculations. Caching might be used later or some other system to improve speed.