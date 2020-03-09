import React from 'react';

import {
  ListContainer
} from './style';

import WorkflowContentCard from '../../WorkflowContentCard';

export default function ReactionList(props) {
  const { reactionList, onDelete } = props;
  return (
    <ListContainer>
      {reactionList.map((elem) => {
        return <WorkflowContentCard
                  key={elem.instance.instanceId}
                  id={elem.reactionId}
                  areaKind={elem.reactionKind}
                  areaType={"reaction"}
                  title={elem.name}
                  onDelete={onDelete}
                />
      })}
    </ListContainer>
  );
}