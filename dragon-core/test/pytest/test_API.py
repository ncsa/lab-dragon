"""
Missing tests that will come later:

- [] Test what entities returns on an empty server.

"""
import json

import tomllib as toml

# keeps current correct structure. Any changes to the structure should be reflected here.
CORRECT_RECT = [
        {
            'name': 'Demo Notebook',
            'type': 'Project',
            'id': '',
            'children': [
                {
                    'name': 'Chocolate mk3 I Tune-up',
                    'type': 'Project',
                    'id': '',
                    'children': [
                        {
                            'name': 'Finding Resonator Frequency',
                            'type': 'Task',
                            'id': '',
                            'children': [
                                {
                                    'name': 'First resonator measurement',
                                    'type': 'Step',
                                    'id': '',
                                    'children': []
                                },
                                {
                                    'name': 'Second resonator measurement',
                                    'type': 'Step',
                                    'id': '',
                                    'children': []
                                },
                            ]
                        },
                        {
                            'name': 'Calibrating Power Rabi',
                            'type': 'Step',
                            'id': '',
                            'children': []
                        },
                        {
                            'name': 'Doing coherence measurements now',
                            'type': 'Task',
                            'id': '',
                            'children': [
                                {
                                    'name': 'T1 Measurement',
                                    'type': 'Step',
                                    'id': '',
                                    'children': []
                                },
                                {
                                    'name': 'T2 Ramsey Measurement',
                                    'type': 'Step',
                                    'id': '',
                                    'children': []
                                },
                                {
                                    'name': 'T2 Echo Measurement',
                                    'type': 'Step',
                                    'id': '',
                                    'children': []
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]


def test_booting_test_server(client):
    """
    Test that the server is booting correctly.
    """
    ret = client.get('/api/health')
    assert ret.status_code == 201


def test_get_entities(client):
    """
    Test the GET endpoint for entities. Dictionary hardcoded based on the simulated environment
    """

    def compare_entity_structure(correct_entity, ret_entity):

        if len(correct_entity) != len(ret_entity):
            print(f'Lengths differ: {len(correct_entity)} != {len(ret_entity)}')
            return False
        
        for exp, act in zip(correct_entity, ret_entity):
            if exp['name'] != act['name']:
                print(f'Names differ: {exp["name"]} != {act["name"]}')
                return False
            
            if exp['type'] != act['type']:
                print(f'Types differ: {exp["type"]} != {act["type"]}')
                return False

            # Only checking if id is present, since this change with every run
            if 'id' not in act:
                return False

            if 'children' not in act:
                print(f'Children not found in entity: {act["name"]}')
                return False

            check_children = compare_entity_structure(exp['children'], act['children'])
            if not check_children:
                return False
            
        return True

    ret = client.get('/api/entities')
    assert ret.status_code == 201
    
    assert compare_entity_structure(CORRECT_RECT, ret.json())
    

def test_post_entities_correct(client):

    # Getting root entity
    entities_response = client.get('/api/entities')
    root_id = entities_response.json()[0]['id']

    # Creating a new entity
    new_entity_arguments = {
        'name': 'New entity',
        'type': 'Project',
        'parent': root_id,
        'user': 'Smaug',
    }

    added_entities_response = client.post('/api/entities', json=new_entity_arguments)

    assert added_entities_response.status_code == 201

    new_structure = client.get('/api/entities').json()
    first_child_names = [x['name'] for x in new_structure[0]['children']]

    assert 'New entity' in first_child_names

    # Updating the new entity, the following is not part of the test.

    CORRECT_RECT[0]['children'].append({'name': 'New entity', 'type': 'Project', 'id': '', 'children': []})


def test_post_entities_incorrect(client):
    # Getting root entity
    entities_response = client.get('/api/entities')
    root_id = entities_response.json()[0]['id']

    # Creating a new entity
    new_entity_arguments = {
        'name': 'New entity',
        'type': 'Project',
        'parent': root_id,
    }

    added_entities_response = client.post('/api/entities', json=new_entity_arguments)

    assert added_entities_response.status_code == 400

    # Creating a new entity
    new_entity_arguments = {
        'name': 'New entity',
        'type': 'Project',
        'user': 'Smaug',
    }

    added_entities_response = client.post('/api/entities', json=new_entity_arguments)

    assert added_entities_response.status_code == 400

    # Creating a new entity
    new_entity_arguments = {
        'name': 'New entity',
        'parent': root_id,
        'user': 'Smaug',
    }

    added_entities_response = client.post('/api/entities', json=new_entity_arguments)

    assert added_entities_response.status_code == 400

    # Creating a new entity
    new_entity_arguments = {
        'type': 'Project',
        'parent': root_id,
        'user': 'Smaug',
    }

    added_entities_response = client.post('/api/entities', json=new_entity_arguments)

    assert added_entities_response.status_code == 400


def test_get_entities_id(client, toml_files):
    """
    Test the GET endpoint for entities with id. Dictionary hardcoded based on the simulated environment.
    """

    for file in toml_files:

        # Getting the entity from TOML
        with file.open('rb') as f:
            entity = toml.load(f)

        # Getting out of the first namespace
        loaded_entity = entity[[x for x in entity.keys()][0]]

        # Parent, children and data buckets comes back with ID instead of path from API.

        # Root entity does not have a parent
        if loaded_entity['parent'] != '':
            with open(loaded_entity['parent'], 'rb') as f:
                parent = toml.load(f)
            parent_id = parent[[x for x in parent.keys()][0]]['ID']
            loaded_entity['parent'] = parent_id

        child_ids = []
        for child in loaded_entity['children']:
            with open(child, 'rb') as f:
                child = toml.load(f)
            child_ids.append(child[[x for x in child.keys()][0]]['ID'])
        loaded_entity['children'] = child_ids

        # FIXME: For some reason data_buckets are returned as paths instead. This is a bug
        # data_buckets_id = []
        # for data_bucket in loaded_entity['data_buckets']:
        #     with open(data_bucket, 'rb') as f:
        #         data_bucket = toml.load(f)
        #     data_buckets_id.append(data_bucket[[x for x in data_bucket.keys()][0]]['ID'])
        # loaded_entity['data_buckets'] = data_buckets_id

        ID = loaded_entity['ID']
        ret = client.get(f'/api/entities/{ID}')
        assert ret.status_code == 201

        ret_entity = json.loads(ret.json())

        for key, val in loaded_entity.items():
            if key not in ret_entity:
                print(f'Key {key} not found in ret_entity')
                assert False
            if key == "comments":
                pass
            else:
                assert val == ret_entity[key]

        # Test the name option
        name = client.get(f'/api/entities/{ID}?name_only=true')
        assert name.status_code == 200
        assert name.json() == loaded_entity['name']


def test_get_entities_id_wrong(client):
    """
    Test that the server returns a 404 when the id is not found.
    """
    ret = client.get('/api/entities/123')
    assert ret.status_code == 404







