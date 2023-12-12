
import Link from 'next/link';
import { useState, useEffect } from 'react';


export const BASE_API = "http://localhost:8000/api/";
export const BASE_URL = 'http://localhost:3000/entities/';


export async function getEntityName(id) {
    let response = await fetch(BASE_API+"entities/" + id + "?name_only=true", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getStoredParams(id) {
    let response = await fetch(BASE_API+"entities/" + id + "/stored_params", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

function RenderDictionary({ data, file, level = 0 }) {
    return (
        <div style={{ paddingLeft: `${level * 20}px` }}>
            <h3>File: {file}</h3>
            {Object.entries(data).map(([key, value], index) => {
                if (typeof value === 'object' && value !== null) {
                    return (
                        <div key={index}>
                            <b>{key}:</b>
                            <RenderDictionary data={value} file={file} level={level + 1} />
                        </div>
                    )
                } else {
                    return (
                        <p key={index}><b>{key}:</b> {value}</p>
                    )
                }
            })}
        </div>
    )
}

export default function InstanceViewer({ entity }) {
    
    const [parentName, setParentName] = useState(null);
    const [storedParams, setStoredParams] = useState({});    

    useEffect(() => {
        if (entity.parent) {
            getEntityName(entity.parent).then(data => {
                setParentName(data);
            });
        }
    }, []);

    useEffect(() => {
        getStoredParams(entity.ID).then(data => {
            console.log("what the hell are you data:", typeof data);
            console.log(JSON.parse(data));
            
            setStoredParams(JSON.parse(data));
        })
    }, []);

    return (
        <div>
            <h1 className="tittle">Instance: {entity.name}</h1>

            <h2 className="entity-header">
            { entity.parent && <p><b>Bucket Owner</b>: <Link className="entity-link" href={ BASE_URL + entity.parent }> {parentName} </Link></p>}
            <p><b>Created by</b>: {entity.user}</p>
            <p><b>Start Time</b>: {entity.start_time}</p>
            <p><b>End Time</b>: {entity.end_time}</p>
            </h2>

            <div className="instance-data-display">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Axis</th>
                            <th>Data Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(entity.data_structure).map(([key, value], index) => (
                            <tr key={index}>
                                <td>{key}</td>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="stored-params">
                <h2>Stored Parameters</h2>
                {Object.entries(storedParams).map(([file, data], index) => {
                    return (
                    <RenderDictionary key={index} data={data} file={file} />)
                    })}
            </div>
        </div>
    )
}
