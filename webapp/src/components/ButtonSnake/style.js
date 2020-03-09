import styled from 'styled-components';
import {withTheme} from "../../utils/theme";

export const FormTitle = styled.p`
  font-size: 20px;
`;

export const FormDescription = styled.p`
  font-size: 16px;
  color: grey;
`;

export const BaseText = withTheme(styled.input`
  margin-bottom: 15px;
  font-size: 20px;
  border-color: ${({ themecolors }) => themecolors.neutral};
  background-color: ${({ themecolors }) => themecolors.neutral};
  color: ${({ themecolors }) => themecolors.inverted_neutral};
  padding: 2px;
  :focus {
    border-color: ${({ themecolors }) => themecolors.primary};
  }
`);

export const AnimatedButton = styled.div`
  color: white;
Button {
  width: 200px;
  height: 100px;
  margin: 0;
  font-family: Cantarell;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  text-transform: uppercase;
  letter-spacing: 2px;
  background-color: #303030;
  color: #673ab7;
  overflow: hidden;
}
Button:hover {
  background-color: #3c3c3c;
}
Button p {
  font-size: calc(5px + 100%);
}
.child1 {
  position: absolute;
  width: 100%;
  height: 4px;
  top: 0;
  left: 0;
  background: linear-gradient(to right, #22144b, #9142eb);
  animation: animate1 2s linear infinite;
}
@keyframes animate1 {
  0%
  {
      transform: translateX(-100%);
  }
  100%
  {
      transform: translateX(100%);
  }
}
.child2 {
  position: absolute;
  width: 4px;
  height: 100px;
  top: 0;
  right: 0;
  background: linear-gradient(to bottom, #22144b, #9142eb);
  animation: animate2 2s linear infinite;
}
@keyframes animate2 {
  0%
  {
      transform: translateY(-100%);
  }
  100%
  {
      transform: translateY(100%);
  }
}
.child3 {
  position: absolute;
  width: 100%;
  height: 4px;
  bottom: 0;
  left: 0;
  background: linear-gradient(to left, #22144b, #9142eb);
  animation: animate3 2s linear infinite;
}
@keyframes animate3 {
  0%
  {
      transform: translateX(100%);
  }
  100%
  {
      transform: translateX(-100%);
  }
}
.child4 {
  position: absolute;
  width: 4px;
  height: 100px;
  top: 0;
  left: 0;
  background: linear-gradient(to top, #22144b, #9142eb);
  animation: animate4 2s linear infinite;
}
@keyframes animate4 {
  0%
  {
      transform: translateY(100%);
  }
  100%
  {
      transform: translateY(-100%);
  }
}

`;
