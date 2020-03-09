import React from 'react';
import BaseWorkflowName from "./style";

function WorkflowName(props) {
  return (
    <BaseWorkflowName>
      <div>{props.name}</div>
    </BaseWorkflowName>
  );
};

export default WorkflowName;