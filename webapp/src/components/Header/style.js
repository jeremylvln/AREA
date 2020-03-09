import styled from 'styled-components';

import { Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';
import {withTheme} from "../../utils/theme";

const HeaderContainer = withTheme(styled.div`
  position: absolute;
  top: -235px;
  left: -300px;
  background-color: ${({ themecolors }) => themecolors.primary};
  border-radius: 50%;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  height: 460px;
  width: 580px;
`);

const LinkWithoutThePetitTraitEnBas = withTheme(styled(Link)`
  color: ${({ themecolors }) => themecolors.inverted_neutral || 'black'};
  text-decoration: none;
`);

const HeaderText = styled(Typography)`
  padding: 20%;
`;

export {
  HeaderContainer,
  HeaderText,
  LinkWithoutThePetitTraitEnBas
};
