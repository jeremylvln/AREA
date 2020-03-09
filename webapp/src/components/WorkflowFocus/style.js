import styled from "styled-components";
import {withTheme} from "../../utils/theme";

export const BaseWorkflowFocus = withTheme(styled.div`
  z-index: 2;
  transform: translate(-115%, -103%);
  height: 95%;
  width: 70%;
  padding: 1%;
  padding-top: 0;
  box-sizing: border-box;
  box-shadow: 1px 4px 18px 2px rgba(0, 0, 0, 0.8);
  transition: 0.5s;
  ${({ show }) => show ?  'transform: translate(0, -103%);' : ''}
`);

export const HeaderWorkflowFocus = styled.div`
  display: flex;
  flex-direction: row;
`;

export const ContentWorkflowFocus = styled.div`
  
`;