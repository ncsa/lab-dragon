The following is simply a place to quickly write down known issues as well as new ideas that come up for the notebook


# Features

* Being able to mention any other instance
* Being able to mention tables instead of only images. Might not be a bad idea to call jupyter notebooks
* Have somewhere in the pages that will let you store arbitrary parameters in the notebook. This will be cool if you can then add another value to that paremeter.
* When you edit something before you save it and change pages, that changed text should be saved somewhere
* How do we handle analysis made out of multiple instances, for example if run 40 overnight sweeps of t1s or t2s, and we create 40 instance for each of those. How dow we handle creating a specific data analysis instance? This probably con be done with a specific type of instance that is a data analysis instance, that just has a field where it list all the other instances it was used to perform this data analysis. this can be controlled by making people use a context that lets the notebook knows of all of the data files that is loading to use create this analysis. Might be way more tricky if discipline is not enforced.



# Known Issues

- If the notebook cannot find some path reference, there should be some way of handling instead of just crashing.
- comments should be refactored to remove comment types
- I need to add comments in convertes to specify what each section of the code is doing. 
- I need a list of a systematic way of testing the curent feautres of the website and code, to make sure everything is working as expected.
- when the notebook tries to look for an entity page that does not exists, it should return a message saying that the page does not exists, instead of crashing.
- make the tasks have some concrete objective that they are meant and how you tick completed tasks. Essentially why are tasks different from steps and projects?

- For now all the configuration of the notebook integration is done as module variables. I might want to at some point figure out how to do it using the options class.
- The plot_suggestions and data suggestions shouild move the /data/ entry path instead of properties
- The way the data structure section in the instance is stored might not be great. The naming of the table is wierd

- when an entity is deleted, the notebook marks the TOML file as deleted and removes it from the parent. But there is no history left there that the entity was a child of someone 
- Clean up all the duplicate images code if we throw that feature away.
- When pressing escape in the entity creation popup, it should close.
- bookmark feature is broken.

## bugs

- when deleting an entity it doesn't go away from the sidebar


# Assumptions

- every msmt folder contains only a single TOML file and that TOML file is a valid entity
- all instance file names are the folder name + .toml

# Tests

- How do we handle a dataset with a failed msmt, like an incomplete msmt

# UI Testing steps

- Create a new entity -> check if it appears in the sidebar, check if the entity shows up in the entity page
- add an image with the character ')' in the name and check if the link is broken.
