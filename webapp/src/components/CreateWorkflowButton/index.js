import React from 'react';

import {
  ButtonContainer,
  Icon
} from './style';

export default function CreateWorkflowButton(props) {
  const { onClick } = props;

  return (
    <ButtonContainer onClick={onClick}>
      <Icon src={require('../../assets/plus.png')} alt=""/>
    </ButtonContainer>
  );
}