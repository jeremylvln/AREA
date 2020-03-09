import React from 'react'
import Button from "@material-ui/core/Button";
import DeleteIcon from '@material-ui/icons/Delete';
import BuildIcon from '@material-ui/icons/Build';
import ConfigurationModal from '../ConfigurationModal';
import { API } from '../../constants';

import {
  Card,
  Title,
  ButtonContainer
} from './style';

export default function WorkflowContentCard(props) {
  const { title, id, areaKind, areaType, onDelete, description } = props;
  const [inputList, setInput] = React.useState(undefined);
  const [open, setOpen] = React.useState(false);

  const onConfirm = async (obj) => {
    const request = {};
    obj.inputs.map((elem) => {
      request[elem.formId] = elem.value;
    });
    try {
      await API.put(`/modules/${areaType}s/${areaKind}/${id}`, request);
      console.log("Object updated with new content : ", request);
      setOpen(false);
    } catch (e) {
      console.log(e);
    }
  }

  const onCancel = () => {
    setOpen(false);
  }

  const getAreaFormInfo = async () => {
    const { data } = await API.get(`/modules/${areaType}s/${areaKind}/form`);
    setInput(data.inputs);
  }

  if (!inputList)
    getAreaFormInfo();
  return (
    <Card>
      <Title style={{textTransform: "capitalize"}}> {title} </Title>
      <ButtonContainer>
        <Button onClick={() => {setOpen(true)}}>
          <BuildIcon/>
        </Button>
        <Button onClick={() => {onDelete(id, areaKind, areaType)}}>
          <DeleteIcon/>
        </Button>
      </ButtonContainer>
      { open && (
        <ConfigurationModal
          open={open}
          focus={open ? {title, description} : null}
          form={open ? {inputs: (inputList ? inputList : [])} : undefined}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      )}
    </Card>
  );
}