import styled from "styled-components";
import {withTheme} from "../../utils/theme";

const BaseWorkflowName = withTheme(styled.div`
  width: auto;
  max-width: 80%;
  display: flex;
  justify-content: space-between;
  height: 10%;
  font-size: 2.5em;
  color: ${({ themecolors }) => themecolors.inverted_neutral};
`);

export default BaseWorkflowName;