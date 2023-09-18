import Link from 'next/link';

import { getEntityName } from '@/app/lib/api_calls';


const BASE_URL = 'http://localhost:3000/entities/';


export default async function EntityViewer(entity) {
    const ent = entity.entity

    const name = ent.name
    const user = ent.user
    const type = ent.type
    const parent = ent.parent
    const children = ent.children

    let parentName = null
    let childrenNames = null

    if (parent) {
        parentName = await getEntityName(parent)
    }

    if (children) {
        childrenNames = await Promise.all(children.map(async (child) => await getEntityName(child)))
    }

    console.log("These are the children names: " + childrenNames + " and these are the ids: " + children)

    return (
        <div>
            <h1 className="entity-tittle">{name}</h1>

            <h2 className="entity-header">
                { parent && <p><b>Parent</b>: <Link className="entity-link" href={ BASE_URL + parent }> {parentName} </Link></p>}
                <p><b>Type</b>: {type}</p>
                <p><b>User</b>: {user}</p>
            </h2>

            <div>
                Hello I am the space where the comments will show up
            </div>

            <h2 className="entity-footer">
                <p><b><u>CONTINUE</u></b></p>
                { children && children.map((child, index) => <p key={index}><Link className="entity-link" href={ BASE_URL + child }> {childrenNames[index]} </Link></p>)}

            </h2>
        </div>

    )

}






