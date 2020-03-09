import React, {useContext} from 'react';

import {
  CardContainer,
  Icon,
  TextContainer,
  Title,
  Description
} from './style';
import { HomeContext } from '../../context/HomeContext';

export default function AreaCard(props) {
  const [ctx, setCtx] = useContext(HomeContext);

  const {
    id,
    areaType,
    serviceType,
    title = "Title of the card",
    description = "This is the description of the Area card",
    form
  } = props;

  const CardInfo = {
    id,
    title,
    description,
    areaType,
    serviceType,
    form
  };

  const iconProvider = (path) => {
    try {
      return require('../../assets/AreaCardIcon/' + path +'.png');
    } catch (e) {
      console.log(`cannot find ${path}`);
      return require('../../assets/logo.svg');
    }
  };

  return (
    <CardContainer draggable="true" onDragStart={() => setCtx({...ctx, cardInfo: CardInfo})}>
      <Icon draggable="false" src={
        iconProvider(serviceType)
      } alt=''/>
      <TextContainer>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </TextContainer>
    </CardContainer>
  );
}