
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';


export async function getEntityName(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "?name_only=true", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

export async function getStoredParams(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id + "/stored_params", {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    return await response.json()
}

function RenderDictionary({ data, file, level = 1 }) {
    return (
        <div style={{ paddingLeft: `${level * 20}px` }}>
            <h3 style={{ paddingLeft: `${(level - 1) * 20}px` }} >File: {file}</h3>
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

    const [structureToggle, setStructureToggle] = useState(true);
    const [imagesToggleArray, setImagesToggleArray] = useState(Array(entity.images.length).fill(true));
    const [analysisToggleArray, setAnalysisToggleArray] = useState(Array(entity.analysis.length).fill(false));
    const [storedParamsToggleArray, setStoredParamsToggleArray] = useState(Array(entity.stored_params.length).fill(false));

    useEffect(() => {
        if (entity.parent) {
            getEntityName(entity.parent).then(data => {
                setParentName(data);
            });
        }
    }, []);

    useEffect(() => {
        getStoredParams(entity.ID).then(data => {
            setStoredParams(JSON.parse(data));
        })
    }, []);

    return (
        <div className="instance-viewer">
            <h1 className="tittle instance">{entity.name}</h1>

            <div className="entity-header">
                {entity.parent && <p><b>Bucket Owner</b>: <Link className="entity-link" href={ entity.parent }> { parentName } </Link></p>}
                <p><b>Created by</b>: {entity.user}</p>
                <p><b>Start Time</b>: {entity.start_time}</p>
                <p><b>End Time</b>: {entity.end_time}</p>
            </div>

            <div className={`instance-data-display ${structureToggle ? "" : "open"}`}>
                <h2>
                    <i className="bi-chevron-down toggle-btn"
                        onClick={() => { setStructureToggle(!structureToggle) }}></i>
                    Data Structure
                </h2>

                {structureToggle &&
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
                }
            </div>

            <div className="instance-images">
                <h2>Instance Images</h2>
                {entity.images.map((imagePath, index) => {
                    const isHTML = imagePath.endsWith(".html");
                    return (
                        <div key={index} className="instance-image">
                            <div>
                                <i className={`bi-chevron-down toggle-btn ${imagesToggleArray[index] ? "" : "open"}`}
                                    onClick={() => {
                                        let newArray = [...imagesToggleArray];
                                        newArray[index] = !newArray[index];
                                        setImagesToggleArray(newArray);
                                    }} />
                            </div>
                            {imagesToggleArray[index] && !isHTML &&
                                <img src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/image/` + imagePath.replace(/\//g, '%23')} alt="Instance Image" />
                            }
                            {imagesToggleArray[index] && isHTML &&
                                <iframe src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/properties/image/` + imagePath.replace(/\//g, '%23')} />
                            }
                        </div>
                    )
                })}

            </div>

            <div className="instance-analysis">
                <h2>Instance Analysis Files</h2>
                {entity.analysis.map(([fileName, html], index) => (
                    <div className="rendered-jnotebook"
                        key={index}>
                        <h3>
                            <i className={`bi-chevron-down toggle-btn ${analysisToggleArray[index] ? "" : "open"}`}
                                onClick={() => {
                                    let newArray = [...analysisToggleArray];
                                    newArray[index] = !newArray[index];
                                    setAnalysisToggleArray(newArray);
                                }}
                            />
                            {fileName}
                        </h3>
                        {analysisToggleArray[index] &&
                            <div dangerouslySetInnerHTML={{ __html: html }} />
                        }
                    </div>

                ))}
            </div>

            <div className="stored-params">
                <h2>Stored Parameters</h2>
                {Object.entries(storedParams).map(([file, data], index) => {
                    return (
                        <div key={index} className="stored-params-container">
                            <i className={`bi-chevron-down toggle-btn ${storedParamsToggleArray[index] ? "" : "open"}`}
                                onClick={() => {
                                    let newArray = [...storedParamsToggleArray];
                                    newArray[index] = !newArray[index];
                                    setStoredParamsToggleArray(newArray);
                                }} />
                            {storedParamsToggleArray[index] &&
                                <RenderDictionary key={index} data={data} file={file} />
                            }
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
