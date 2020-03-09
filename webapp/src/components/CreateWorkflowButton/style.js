import styled from 'styled-components';
import {withTheme} from "../../utils/theme";

export const ButtonContainer = withTheme(styled.div`
  :hover {
    border-style: solid;
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  height: 230px;
  width: 20vw;
  min-width: 200px;
  margin: 1vw;
  transition: 0.60s;

  border-radius: 1em;
  border-style: dashed;
  border-width: 2px;
  border-color: ${ ({ themecolors }) => themecolors.inverted_neutral };
`);

export const Icon = styled.img`
  :hover {
    filter: constrast(0%);
  }
`;
