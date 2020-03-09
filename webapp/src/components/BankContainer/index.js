import React, {useContext} from "react";
import {BaseBankContainer, InventoryContainer} from "./style";
import {HomeContext} from "../../context/HomeContext";
import ActionInventoryContainer from '../InventoryContainer/ActionInventoryContainer';
import ReactionInventoryContainer from '../InventoryContainer/ReactionInventoryContainer';

function BankContainer() {
  const [ctx] = useContext(HomeContext);

  return (
    <BaseBankContainer hide={ctx.workflowId === null}>
      <InventoryContainer hide={ctx.workflowId === null} >
        <ActionInventoryContainer/>
      </InventoryContainer>
      <InventoryContainer hide={ctx.workflowId === null }>
        <ReactionInventoryContainer/>
      </InventoryContainer>
    </BaseBankContainer>

  );
};

export default BankContainer;