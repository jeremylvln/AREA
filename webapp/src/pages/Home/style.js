import styled from 'styled-components';
import {withTheme} from "../../utils/theme";

export const PageContainer = withTheme(styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${({ themecolors }) => themecolors.neutral};
  display: block;
`);

export const HomeContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: -webkit-fill-available;
  height: 75%;
`;

export const AreaContainer = withTheme(styled.div`
  z-index: 1;
  transition: 0.5s;
  padding: 1%;
  padding-bottom: 0;
  width: 100%;
  padding-left: 4%;
  overflow: hidden;
`);

export const WorkflowContainer = withTheme(styled.div`
  background-color: ${({ themecolors }) => themecolors.neutral || '#FFFFFF'};
  transition: ${({ hide }) => hide ? '0.35s' : '3s'};
  border-radius: 3em 3em 0em 0em;
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  ${({ hide }) => hide ? 'opacity: 0;' : ''}
  overflow: auto;
`);
