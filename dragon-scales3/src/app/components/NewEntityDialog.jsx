"use client"


import {useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";

import {createEntity} from "@/app/utils";


export default function NewEntityDialog({ user, type, parentName, parentID,  open, onClose, reloadParent }) {

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={onClose}
            PaperProps={{
                component: 'form',
                onSubmit: (e) => {
                    e.preventDefault();
                    const success = createEntity(e.target.name.value, user, type, parentID).then(() => {
                        if (success) {
                            reloadParent();
                            onClose();
                        } else {
                            console.error("Error creating new entity");
                        }
                    });
                }
            }}
            >
            <DialogTitle>Add New <em>{type}</em> to <b><em>{parentName}</em></b></DialogTitle>
            <DialogContent>
                <DialogContentText>Please enter name of new {type}</DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label={`New ${type} Name`}
                    type="text"
                    fullWidth
                    variant="standard"
                    autoComplete="off"
                    />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit">Create</Button>
            </DialogActions>
        </Dialog>
    )
}

//     const [name, setName] = useState("");
//     const [helperText, setHelperText] = useState("");
//
//     const handleNameChange = (event) => {
//         setName(event.target.value);
//     }
//
//     const handleSubmit = () => {
//         if (name === "") {
//
//             setHelperText("Name cannot be empty");
//         } else {
//
//             setHelperText("");
//             createEntity(name, user, type, parentID).then(() => {
//                 onClose();
//             });
//         }
//     }
//
//     return (
//         <Dialog open={open} onClose={onClose}>
//             <DialogTitle>Add New {type} to {parentName}</DialogTitle>
//             <DialogContent>
//                 <TextField
//                     autoFocus
//                     margin="dense"
//                     id="name"
//                     label="Name"
//                     type="text"
//                     fullWidth
//                     onChange={handleNameChange}
//                     helperText={helperText}
//                 />
//
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={onClose} color="primary">
//                     Cancel
//                 </Button>
//                 <Button onClick={handleSubmit} color="primary">
//                     Create
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     )
// }
































