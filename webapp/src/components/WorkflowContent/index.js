import React, {useContext} from 'react';
import { HomeContext } from '../../context/HomeContext';

import ActionList from './ActionList';
import ReactionList from './ReactionList';

import {
  ContentContainer,
  ActionContainer,
  ActionTitle,
  ReactionContainer,
  ReactionTitle,
  ArrowContainer,
  Arrow
} from './style';

import {API} from "../../constants";

export default function WorkflowContent(props) {
  const [ctx] = useContext(HomeContext);
  const {actionList, setActionList, reactionList, setReactionList} = props;

  async function onDelete(id, kind, areaType) {
    try {
      console.log(`DELETE /modules/${areaType}s/${kind}/${id}`);
      await API.delete(`/workflows/${ctx.workflowId}/${areaType}s/${kind}/${id}`);
      await API.delete(`/modules/${areaType}s/${kind}/${id}`);
      if (areaType === "action") {
        console.log(actionList);
        const newActionList = actionList.filter((elem) => !(elem[`${areaType}Id`] === id && elem.actionKind === kind));
        setActionList(newActionList);
      } else if (areaType === "reaction") {
        const newReactionList = reactionList.filter((elem) => !(elem[`${areaType}Id`] === id && elem.reactionKind === kind));
        setReactionList(newReactionList);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ContentContainer>
      <ActionContainer>
        <ActionTitle> Action </ActionTitle>
        <ActionList actionList={actionList} onDelete={onDelete}/>
      </ActionContainer>
      <ArrowContainer>
        <Arrow src={require('../../assets/arrow.png')} alt=""/>
      </ArrowContainer>
      <ReactionContainer>
        <ReactionTitle> Reaction </ReactionTitle>
        <ReactionList reactionList={reactionList} onDelete={onDelete}/>
      </ReactionContainer>
    </ContentContainer>
  );
}
