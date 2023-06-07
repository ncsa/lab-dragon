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
             comments = [],
             related_links = [],
             params = []):

    doc = tomlkit.document()
    fields = tomlkit.table()
    id_ = str(uuid.uuid4())
    fields['id'] = id_
    if name != '':
        fields['name'] = name
    else:
        fields['name'] = f'entity_{id_}'

    fields['parent_link'] = parent_link
    fields['user'] = user
    fields['description'] = description
    fields['comments'] = comments
    fields['related_links'] = related_links
    fields['params'] = params
    doc['fields'] = fields

    return doc

if __name__ == '__main__':
    print(f'Entities do not have direct generators. Aborting.')
