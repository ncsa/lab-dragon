"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BASE_API = "http://localhost:8000/api/"

export default function StepCreator({entID, user, reloader, reloader1}) {
    const router = useRouter();
    const type = "Step"
    const parent = entID
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const newStep = {
            name, user, type, parent
        }

        let response = await fetch(BASE_API + "entities", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newStep),
        });

        if (response.status === 201) {
            reloader1();
            reloader();
            setName("");
            setIsLoading(false);
        } else {
            alert ("Something went wrong, please try again.")
            setIsLoading(false)
        }
    }

    return (
        null
        // <div className="StepCreator">
        //     <h2>Add a Step</h2>
        //     <form onSubmit={handleSubmit}>
        //         <textarea
        //             required
        //             placeholder="Write the name of the Step here..."
        //             onChange={e => setName(e.target.value)}
        //             value={name}
        //         />
        //         {isLoading && <p>Loading...</p>}
        //         {!isLoading && <button type="submit" className='submitButton'>Submit</button>}
        //     </form>
        // </div>
    )
}




