import React, {useContext} from "react";
import VisibilityIcon from '@material-ui/icons/Visibility';
import FlashOnIcon from '@material-ui/icons/FlashOn';
import {
  BaseWorkflowCard,
  FooterWorkflowCard,
  TitleWorkflowCard
} from "./style";
import WorkflowPowerButton from "../WorkflowPowerButton";
import {string, object} from "prop-types";
import {HomeContext} from "../../context/HomeContext";
import { Button } from "@material-ui/core";
import DeleteIcon from '@material-ui/icons/Delete';

function WorkflowCard(props) {
  const [ctx, setCtx] = useContext(HomeContext);

  const { title, id, color, data, onDelete } = props;

  return (
    <BaseWorkflowCard backgroundColor={color}>
        <TitleWorkflowCard  onClick={() => setCtx({ ...ctx, workflowId: id, showBank: true })}>
          {title}
        </TitleWorkflowCard>
      <FooterWorkflowCard>
        <div style={{ margin: 'auto 0', display: 'flex' }}>
          <VisibilityIcon />{data.actions.length}
          <div style={{ minWidth: '25%' }}/>
          <FlashOnIcon />{data.reactions.length}
        </div>
        <div>
          <WorkflowPowerButton style={{ color }} enabled={data.enabled} id={id}/>
          <Button onClick={onDelete}>
            <DeleteIcon style={{color: "white"}}/>
          </Button>
        </div>
      </FooterWorkflowCard>
    </BaseWorkflowCard>
  );
};
WorkflowCard.PropType = {
  title: string.isRequired,
  id : string.isRequired,
  data: object.isRequired,
  color: string
};
WorkflowCard.defaultProps = {
  color: '#6A4EB7'
};

export default WorkflowCard;