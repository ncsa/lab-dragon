"use client"
import { useEffect, useState, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CreationPopupContext } from "@/app/contexts/CreationPopupContext";


function isUUID(str) {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(str);
  }

export default function EntityInput( {populateSideBar} ) {

    const router = useRouter();

    // Variables used to hold the different options that the fields can have
    const { userOptions, setUserOptions } = useContext(CreationPopupContext);
    const { typesOptions, setTypesOptions } = useContext(CreationPopupContext);
    const { parentsOptions, setParentsOptions } = useContext(CreationPopupContext);

    // Variables holding the form values, getting from context so other components can access them
    const { name, setName } = useContext(CreationPopupContext);
    const { user, setUser } = useContext(CreationPopupContext);
    const { type, setType } = useContext(CreationPopupContext);
    const { parent, setParent } = useContext(CreationPopupContext);
    const [isLoading, setIsLoading] = useState(false);

    const { isPopupOpen, setIsPopupOpen } = useContext(CreationPopupContext);

    const currentPath = usePathname();
    if (parent === null || parent === undefined || parent === "") {
        const currentPathSliced = currentPath.slice(-36);
        const defaultParent = isUUID(currentPathSliced) ? currentPathSliced : "";
        setParent(defaultParent);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newEntity = {
            name, user, type, parent
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities`, {
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
            response.text().then(text => alert(`Something went wrong: ${JSON.parse(text)['detail']}`));
            closeFunction();
        } else {
            alert("Something went wrong");
            closeFunction();
        }
    }

    const closeFunction = () => {
        setIsPopupOpen(false);
    };

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
                                typesOptions && typesOptions.map((type, index) => (
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


