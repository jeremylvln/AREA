import React from 'react';

import {
  HeaderContainer,
  HeaderText,
  LinkWithoutThePetitTraitEnBas
} from './style';

export default function Header(props) {
  return (
    <HeaderContainer>
      <HeaderText variant='h2'>
        <LinkWithoutThePetitTraitEnBas to="/home">Area </LinkWithoutThePetitTraitEnBas>
      </HeaderText>
    </HeaderContainer>
  );
}