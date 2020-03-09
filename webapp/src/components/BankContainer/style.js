import styled from 'styled-components';
import {withTheme} from "../../utils/theme";

export const BaseBankContainer = styled.div`
  position: absolute;
  z-index: ${props => props.hide ? 0 : 1};
  overflow: hidden;
  bottom: 0%;
  right: 0%;
  height: 75%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 26%;
  align-items: flex-end;
`;

export const BaseBankButton = withTheme(styled.div`
  position: absolute;
  text-align: center;
  writing-mode: vertical-lr;
  background-color: ${({ themecolors }) => themecolors.primary};
  top: 0;
  left: -10%;
  width: 10%;
  height: 15%;
  border-radius: 15% 0% 0% 15%;
`);


export const InventoryContainer = withTheme(styled.div`
  position: relative;
  transition: 0.5s;
  background-color: ${({ themecolors }) => themecolors.primary};
  padding: 2%;
  height: 44%;
  width: 94%;
  ${({ hide }) => hide ? '' +
  'transform: translate(100%, 0);'
  : '' }
  overflow: auto;
`);