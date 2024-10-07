

# List of api calls with tests

- [X] GET /health
- [ ] POST /reset
- [X] GET /entities
- [X] POST /entities
- [X] GET /entities/{entity_id}
- [ ] PUT /entities/{entity_id}
- [X] DELETE /entities/{entity_id}
- [X] PATCH /entities/{entity_id}
- [ ] GET /entities/{entity_id}/{comment_id}
- [ ] PATCH /entities/{entity_id}/{comment_id}
- [ ] GET /entities/{entity_id}/info
- [ ] GET /entities/{entity_id}/tree
- [ ] GET /entities/{entity_id}/stored_params
- [X] POST /entities/{entity_id}/toggle_bookmark
- [ ] POST /data
- [ ] PATCH /data
- [ ] GET /data/buckets
- [ ] PATCH /data/toggle_star
- [ ] GET /properties/data_suggestions/{id}
- [ ] GET /properties/graphic_suggestions/{id}
- [ ] POST /properties/image
- [ ] GET /properties/image/{imagePath}
- [ ] GET /testing/indices
- [ ] GET /testing/fake_mentions


# Extra tests on behaviours:

- [ ] Test that when creating a new entity, the API checks that the type requested can be a child of the parent entity.
- [ ] Test that you cannot have multiple libraries with the same name. Entities can have the same name but not libraries.