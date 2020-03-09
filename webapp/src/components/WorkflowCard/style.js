import styled from "styled-components";
import {withTheme} from "../../utils/theme";

export const BaseWorkflowCard = withTheme(styled.div`
  z-index: 1;
  margin: 1vw;
  display: flex;
  background-color: ${({ themecolors }) => themecolors.neutral};
  flex-direction: column;
  justify-content: space-between;
  width: 20vw;
  min-width: 200px;
  height: 230px;
  box-sizing: border-box;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.8);
  transition: 0.25s;
  :hover {
    background-color: ${({ themecolors }) => themecolors.primary};
  }
`);

export const TitleWorkflowCard = withTheme(styled.div`
  padding: 10% 5%;
  height: 55%;
  font-size: 30px;
  overflow-wrap: break-word;
  color: ${({ themecolors }) => themecolors.inverted_neutral};
`);

export const FooterWorkflowCard = withTheme(styled.div`
  margin: auto 5%;
  height: 15%;
  display: flex;
  justify-content: space-between;
  color: ${({ themecolors }) => themecolors.inverted_neutral};
`);