"use client"

import Draggable from 'react-draggable';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Paper} from "@mui/material";

import {createLibrary} from "@/app/utils";

function PaperComponent(props) {
    return (
      <Draggable
        handle="#draggable-dialog-title"
        cancel={'[class*="MuiDialogContent-root"]'}
      >
        <Paper {...props} />
      </Draggable>
    );
  }

export default function NewLibraryDialog({ user, open, onClose, reloadParent }) {

    return (
        <Dialog
            fullWidth
            open={open}
            onClose={onClose}
            PaperComponent={PaperComponent}
            aria-labelledby="draggable-dialog-title"
            PaperProps={{
                component: 'form',
                onSubmit: (e) => {
                    e.preventDefault();
                    const success = createLibrary(e.target.name.value, user).then(() => {
                        if (success) {
                            reloadParent();
                            onClose();
                        } else {
                            console.error("Error creating new Library");
                        }
                    });
                }
            }}
            >
            <DialogTitle>Add New <em>Library</em></DialogTitle>
            <DialogContent>
                <DialogContentText>Please enter name of the new <em>Library</em></DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label={`New Library Name`}
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





