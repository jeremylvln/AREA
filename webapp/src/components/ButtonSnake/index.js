import React from 'react';
import Button from "@material-ui/core/Button";
import {
  AnimatedButton,
  BaseText,
  FormTitle,
  FormDescription
} from './style';
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions"
import {API, BACK_ADDRESS} from "../../constants";

export default function ButtonAnimatedBorder(props) {
  const {gotModal, handleOpen, handleClose, open, href, inputs, url} = props;
  const [form, setForm] = React.useState({});

  const handleChange = (formId, event) => {
    const newForm = {...form};
    newForm[formId] = event.target.value;
    setForm(newForm);
  }

  const handleConfirm = async () => {
    try {
      await API.post(`${BACK_ADDRESS}${url}`, form);
      handleClose();
    } catch (e) {
      console.log(e);
    }
  }

  let indexForm = 0;
  const buildForm = () => {
    const inputArray = inputs.map((elem) => {
      return (
      <div key={indexForm++}>
        <FormTitle> {elem.name} </FormTitle>
        <FormDescription> {elem.description}</FormDescription>
        <BaseText type="text" value={form[elem.formId] ? form[elem.formId] : ""} name={elem.name} onChange={(e) => {handleChange(elem.formId, e)}}/>
      </div>
      );
    })
    return inputArray;
  }


  return (
    <AnimatedButton>
      { href ?
      <a href={href} style={{ textDecoration: 'none'}}>
        <Button>
          <span className='child1'></span>
          <span className='child2'></span>
          <span className='child3'></span>
          <span className='child4'></span>
          <p>{props.title}</p>
        </Button>
      </a>
      :
      <Button onClick={handleOpen}>
        <span className='child1'></span>
        <span className='child2'></span>
        <span className='child3'></span>
        <span className='child4'></span>
        <p>{props.title}</p>
      </Button>
      }
      {gotModal ?
        <Dialog open={open} onClose={handleClose} fullWidth>
          <DialogTitle> {`Connect to the service`}  </DialogTitle>
          <DialogContent style={{ display:"flex", flexDirection: "column" }}>
            <p>In order to connect this service to AREA, you need to fill this form : </p>
            {buildForm()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      :
      <></>
      }
    </AnimatedButton>
  );
}
