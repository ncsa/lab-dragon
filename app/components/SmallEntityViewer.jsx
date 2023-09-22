import Link from 'next/link';

import CommentViewer from "@/app/components/CommentViewer";

export const BASE_URL = 'http://localhost:3000/entities/';

export default function SmallEntityViewer({entity}) {

    return (
        <div className="small-entity">
            <h3 className="entity-tittle">
                <Link className="entiy-tittle" href={BASE_URL + entity.ID}>{entity.name}</Link>
            </h3>

            <CommentViewer comments={entity.comments} entID={entity.ID}/>
        </div>
    )

}

