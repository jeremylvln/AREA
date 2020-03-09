import React, {useState} from 'react';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {Typography} from "@material-ui/core";
import styled from "styled-components";
import {withTheme} from "../../utils/theme";

const BaseText = withTheme(styled.input`
  margin-bottom: 15px;
  font-size: 20px;
  border-color: ${({ themecolors }) => themecolors.neutral};
  background-color: ${({ themecolors }) => themecolors.neutral};
  color: ${({ themecolors }) => themecolors.inverted_neutral};
  padding: 2px;
  :focus {
    border-color: ${({ themecolors }) => themecolors.primary};
  }
`);

function NameModal(props) {
  const {
    open,
    onConfirm,
    onClose
  } = props;
  const [newName, setNewName] = useState("");

  function handleChange(event) {
    setNewName(event.target.value);
  }

  function handleSubmit() {
    console.log(newName);
    onConfirm(newName);
  }

  return (
    <Dialog open={open} onClose={() => onClose()} aria-labelledby="form-dialog-title" fullWidth>
      <DialogTitle id="form-dialog-title" disableTypography>
        <Typography variant="h4">Changement de nom</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography paragraph align="justify">
          Veuillez entrer le nouveau nom de votre workflow
        </Typography>
        <BaseText maxLength={25} type="text" value={newName} onChange={handleChange} name={"New Name"}/>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NameModal;