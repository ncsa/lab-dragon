"use client"
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const BASE_API = "http://localhost:8000/api/"

function isUUID(str) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(str);
  }
  

async function getUsers() {
    const response = await fetch(BASE_API + "properties/users");
    return await response.json();
}

async function getTypes() {
    const response = await fetch(BASE_API + "properties/types");
    return await response.json();
}

async function getParents() {
    const response = await fetch(BASE_API + "properties/parents");
    return await response.json();
}

export default function EntityInput({closeFunction, populateSideBar}) {
    const router = useRouter();

    // Variables used to hold the different options that the fields can have
    const [userOptions, setUserOptions] = useState([]);
    const [TypesOptions, setTypesOptions] = useState([]);
    const [parentsOptions, setParentsOptions] = useState([]);

    // Figure out what the default parent should be
    const currentPathSliced = usePathname().slice(-36);
    const defaultParent = isUUID(currentPathSliced) ? currentPathSliced : "";

    // Variables holding the form values
    const [name, setName] = useState("");
    const [user, setUser] = useState("");
    const [type, setType] = useState("");
    const [parent, setParent] = useState(defaultParent);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getUsers().then(data => {
            setUserOptions(JSON.parse(data));
        });
    }, []);

    useEffect(() => {
        getTypes().then(data => {
            setTypesOptions(JSON.parse(data));
        });
    }, []); 

    useEffect(() => {
        getParents().then(data => {
            setParentsOptions(JSON.parse(data));
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("I have got the following event")
        console.log(e)
        setIsLoading(true);

        const newEntity = {
            name, user, type, parent
        }
        console.log("I am about to send the following entity")
        console.log(newEntity)
        const response = await fetch(BASE_API + "entities", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newEntity)
        });

        if (response.status === 201) {
            populateSideBar();
            router.refresh();
            closeFunction();
        } else if (response.status === 400) {
            alert("Invalid entity");
            closeFunction();
        } else {
            alert("Something went wrong");
            closeFunction();
        }

    }

    return (
        <div className="entity-popup">
            <button className="close" onClick={closeFunction}>X</button>
            <div className="content">
                <h1>Add Entity Fields</h1>
                <form onSubmit={handleSubmit}>
                    <ul>
                        <li>
                            <label>Entity Name:</label>
                            <input
                                required
                                type="text"
                                onChange={e => setName(e.target.value)}
                                value={name}
                            />
                        </li>
                        <li>
                            <label>User:</label>
                            <select
                                onChange={(e) => setUser(e.target.value)}
                                value={user}
                            >
                                {
                                userOptions && userOptions.map((user, index) => (
                                    <option key={index} value={user}>{user}</option>
                                ))}
                            </select>
                        </li>
                        <li>
                            <label>Type:</label>
                            <select
                                onChange={(e) => setType(e.target.value)}
                                value={type}
                            >
                                {
                                TypesOptions && TypesOptions.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </li>
                        <li>
                            <label>Parent:</label>
                            <select 
                                value={parent}
                                onChange={e => (setParent(e.target.value))}>
                                {
                                parentsOptions && Object.entries(parentsOptions).map(((obj,index) => {
                                    return <option key={obj[1]+"("+obj[0]+")"} value={obj[0]}>{obj[1]} ({obj[0]})</option>
                                }))}
                            </select>
                        </li>
                    </ul>
                    <button 
                        className='submit'
                        disabled={isLoading}
                    >
                        {isLoading && <span>Creating...</span>}
                        {!isLoading && <span>Create Entity</span>}
                    </button>
                </form>
            </div>
        </div>
    )
}


