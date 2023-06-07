# IQUIST/NCSA
# UIUC
import os
import uuid
import tomlkit
from datetime import datetime

def _generate(name = '',
             parent_link = '',
             user = 'default',
             description = '',
             related_links = '',
             params = ''):

    timestamp = datetime.now().isoformat()

    doc = tomlkit.document()
    fields = tomlkit.table()
    id = str(uuid.uuid4())
    fields['id'] = id
    fields['timestamp'] = timestamp
    if name != '':
        fields['name'] = name
    else:
        fields['name'] = f'entity_{id}'

    fields['parent_link'] = parent_link
    fields['user'] = user
    fields['description'] = description
    fields['related_links'] = related_links
    fields['params'] = params
    doc['fields'] = fields

    return doc

if __name__ == '__main__':
    print(f'Entities do not have direct generators. Aborting.')
