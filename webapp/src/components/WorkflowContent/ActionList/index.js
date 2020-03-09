import React from 'react';

import {
  ListContainer
} from './style';

import WorkflowContentCard from '../../WorkflowContentCard';

export default function ActionList(props) {
  const { actionList, onDelete } = props;
  return (
    <ListContainer>
      {actionList.map((elem) => {
        return <WorkflowContentCard
                  key={elem.instance.instanceId}
                  id={elem.actionId}
                  areaKind={elem.actionKind}
                  areaType={"action"}
                  title={elem.name}
                  description={elem.description}
                  onDelete={onDelete}
                />
      })}
    </ListContainer>
  );
}