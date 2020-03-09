import React, {useEffect, useState} from 'react';
import { func, bool, object } from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import {Typography} from "@material-ui/core";
import ConfigurationInputProvider from "../ConfigurationInputProvider";

const formStateGenerator = (inputs) => {
  return inputs.map(e => {
    if (e.kind === "select" || e.kind === "radiobox")
      return {
        kind: e.kind,
        formId: e.formId,
        name: e.name,
        value : e.choices[0].value
      };
    if (e.kind === "checkbox")
      return {
        kind: e.kind,
        formId: e.formId,
        name: e.name,
        value : false
      };
    return {
      kind: e.kind,
      formId: e.formId,
      name: e.name,
      value: "",
    };
  });
};

function ConfigurationModal(props) {
  const {
    open,
    onConfirm,
    onCancel,
    form,
    focus
  } = props;
  const [formState, setFormState] = useState({ focus: null, inputs: formStateGenerator(form.inputs) });

  useEffect(() => {
    if (focus !== formState.focus) {
      setFormState({ focus: focus, inputs: formStateGenerator(form.inputs) });
    }
  }, [focus, form.inputs, formState.focus]);

  const handleClose = (event) => event === 'confirm' ? onConfirm(formState) : onCancel();

  const handleChange = event => {
    let index = formState.inputs.findIndex(f => f.name === event.name);
    if (index === -1) return;
    let newFormState = formState.inputs;
    newFormState[index].value = event.value;
    setFormState({ ...formState, inputs: newFormState });
  };

  return (
    <Dialog open={open} onClose={() => handleClose('cancel')} aria-labelledby="form-dialog-title" fullWidth>
      <DialogTitle id="form-dialog-title" disableTypography><Typography variant="h4">{focus ? `${focus.title} ` : ''}Configuration</Typography></DialogTitle>
      <DialogContent>
        <Typography paragraph align="justify">
          {focus ? focus.description : ''}
        </Typography>
        {form.inputs.map((e, index) => (
          <React.Fragment key={e.name}>
            <Typography paragraph variant="h5">{`${e.name} ${e.optional ? " (Optional) " : ""}`}</Typography>
            <Typography paragraph align="justify">
              {e.description ? e.description : ''}
            </Typography>
            <ConfigurationInputProvider input={e} state={formState.inputs[index]} onChange={(event) => handleChange(event)}/>
          </React.Fragment>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose('cancel')} color="primary">
          Cancel
        </Button>
        <Button onClick={() => handleClose('confirm')} color="primary">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}
ConfigurationModal.PropsType = {
  open: bool.isRequired,
  onConfirm: func.isRequired,
  onCancel: func.isRequired,
  form: object,
  focus: object
};
ConfigurationModal.defaultProps = {
  form: {
    inputs: []
  }
};

export default ConfigurationModal;