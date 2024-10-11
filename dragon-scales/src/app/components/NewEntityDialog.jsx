"use client"


import {useState} from "react";
import Draggable from 'react-draggable';
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Paper} from "@mui/material";

import {createEntity} from "@/app/utils";

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

export default function NewEntityDialog({ user, type, parentName, parentID,  open, onClose, reloadParent }) {

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


































