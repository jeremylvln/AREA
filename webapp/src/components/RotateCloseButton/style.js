import styled from "styled-components";
import {withTheme} from "../../utils/theme";

const BaseRotateCloseButton = withTheme(styled.div`
  background-color: ${({ themecolors }) => themecolors.neutral};
  box-shadow: -5px 5px 10px 0px rgba(0, 0, 0, 0.8);
  border-radius: 1em;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  text-align: -webkit-center;
  .child1, .child2 {
    transition: 1.5s cubic-bezier(0.88, 2.01, 0.56, 0.65);
    margin: 0 10%;
    height: 2px;
    background-color: ${({ themecolors }) => themecolors.inverted_neutral};
  }
  .child1 {
    transform: translate(0, calc(${({ size }) => size} / 2)) rotate(45deg);
  }
  .child2 {
    transform: translate(0, calc(${({ size }) => size} / 2 - 2px)) rotate(135deg);
  }
  :hover {
    .child1 {
      transform: translate(0, calc(${({ size }) => size} / 2)) rotate(540deg);
    }
    .child2 {
      transform: translate(0, calc(${({ size }) => size} / 2 - 2px)) rotate(540deg);
    }
  }
`);

export default BaseRotateCloseButton;