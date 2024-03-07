The following is simply a place to quickly write down known issues as well as new ideas that come up for the notebook


# Features

* Being able to mention any other instance

# Known Issues

- If the notebook cannot find some path reference, there should be some way of handling instead of just crashing.
- comments should be refactored to remove comment types
- I need to add comments in convertes to specify what each section of the code is doing. 
- I need a list of a systematic way of testing the curent feautres of the website and code, to make sure everything is working as expected.
- when the notebook tries to look for an entity page that does not exists, it should return a message saying that the page does not exists, instead of crashing.
- make the tasks have some concrete objective that they are meant and how you tick completed tasks. Essentially why are tasks different from steps and projects?
- If the entity is not long enough the text in the buttons gets smaller and runs off in the background
- Make the editing of comments as well as adding more comments behave like the editing of titles instead of relying on state variables

- For now all the configuration of the notebook integration is done as module variables. I might want to at some point figure out how to do it using the options class.
- The plot_suggestions and data suggestions shouild move the /data/ entry path instead of properties
- The way the data structure section in the instance is stored might not be great. The naming of the table is wierd

# Tests

- How do we handle a dataset with a failed msmt, like an incomplete msmt


