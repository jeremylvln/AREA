import React, {useContext, useState} from 'react';
import {BaseWorkflowFocus, HeaderWorkflowFocus} from "./style";
import RotateCloseButton from "../RotateCloseButton";
import { API } from "../../constants";
import {HomeContext} from "../../context/HomeContext";
import WorkflowName from "../WorkflowName";
import WorkflowContent from "../WorkflowContent";
import ConfigurationModal from "../ConfigurationModal";
import NameModal from '../NameModal';
import { Button } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

function WorkflowFocus(props) {
  const [ctx, setCtx] = useContext(HomeContext);
  const [actionList, setActionList] = useState([]);
  const [reactionList, setReactionList] = useState([]);
  const [modalConfig, setModalConfig] = React.useState({focus: null, open: false });
  const [openModalName, setOpenModalName] = useState(false)
  const { changeName, show, name } = props;

  const handleCancel = () => {
    console.log('cancel');
    setModalConfig({...modalConfig, open: false});
  };

  const closeNameModal = () => {
    setOpenModalName(false);
  }

  const formatDataRequest = (form) => {
    let data = {};
    form.inputs.forEach((e, index) => {
      if (e.value === "" && form.focus.form.inputs[index].optional)
        return;
      data[form.focus.form.inputs[index].formId] = e.value;
    });
    return data;
  };

  const handleConfirm = async (form) => {
    console.log('confirm');
    try {
      const createResponse = await API.post(`/modules/${ctx.cardInfo.areaType}s/${ctx.cardInfo.id}`, formatDataRequest(form));
      await API.post(`/workflows/${ctx.workflowId}/${ctx.cardInfo.areaType}s`, {
        id: createResponse.data.instanceId,
        kind: ctx.cardInfo.id,
      });
      setModalConfig({...modalConfig, open: false});
      fetchWorkflowData();
    } catch (e) {
      console.log(e);
    }
  };

  function addCardToWorkflow(type) {
    console.log('cardInfo', ctx.cardInfo)
    if (type === "action") {
      setModalConfig({focus: ctx.cardInfo, open: true});
    }
    else if (type === "reaction")
      setModalConfig({focus: ctx.cardInfo, open: true});
  }

  async function fetchWorkflowData() {
    const { data } = await API.get(`/workflows/${ctx.workflowId}`);
    setCtx({...ctx, workflowActions: data.actions, workflowReactions: data.reactions});
    setActionList(data.actions);
    setReactionList(data.reactions);
  }

  if (ctx.workflowId && (!ctx.workflowActions || !ctx.workflowReactions))
    fetchWorkflowData();
  return (
    <>
      <BaseWorkflowFocus
        name={name}
        show={show}
        onDragOver={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDrop={() => {addCardToWorkflow(ctx.cardInfo.areaType)}}
      >
        <span style={{ height: '5%', display: 'flex', flexDirection: "row-reverse" }}>
          <RotateCloseButton
            size="3vw"
            style={{ transform: 'translate(45%, -25%)' }}
            onClick={() => setCtx({ ...ctx, workflowId: null, workflowActions: undefined, workflowReactions: undefined })}
          />
        </span>
        <HeaderWorkflowFocus>
          <WorkflowName name={props.name}/>
          <Button onClick={() => {setOpenModalName(true)}}>
            <EditIcon style={{color: "white"}}/>
          </Button>
        </HeaderWorkflowFocus>
        <WorkflowContent actionList={actionList} setActionList={setActionList} reactionList={reactionList} setReactionList={setReactionList}/>
      </BaseWorkflowFocus>
      { openModalName &&
        <NameModal
          open={openModalName}
          onConfirm={(newName) => {changeName(newName); setOpenModalName(false)}}
          onClose={closeNameModal}
        />
      }
      { modalConfig.open &&
        <ConfigurationModal
          open={modalConfig.open}
          focus={modalConfig.focus}
          form={modalConfig.focus ? modalConfig.focus.form : undefined}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      }
    </>
);
}

export default WorkflowFocus;