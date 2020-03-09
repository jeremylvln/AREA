import styled from 'styled-components';

const BaseHoverButton = styled.button`
  background: ${({ backgroundColor }) => backgroundColor};
  border: 2px solid;
  font: inherit;
  line-height: 1;
  margin: 0.5em;
  padding: 1em 2em;
  border-color: ${({ color }) => color};
  color: ${({ textColor }) => textColor};
  transition: ${({ transition }) => transition}ms;
  width: ${({ width }) => width};
  height: ${({ height }) => height};
  :focus, :hover {
    border-color: ${({ hoverColor }) => hoverColor};
    color: ${({ hoverTextColor }) => hoverTextColor};
  }
  ${({ type, hoverColor }) => type === 'fill-in' && (
    `
    :focus, :hover {
      box-shadow: inset 0 0 0 2em ${hoverColor};
    }
    `
  )}
  ${({ type, hoverColor }) => type === 'fill-up' && (
  `
    :focus, :hover {
      box-shadow: inset 0 -4em 0 0 ${hoverColor};
    }
    `
  )}
  ${({ type, hoverColor }) => type === 'pulse' && (
  `
    :focus, :hover {
      animation: pulse 1s;
      box-shadow: 0 0 0 2em transparent;
    }
    `
  )}
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 ${({ hoverColor }) => hoverColor}; }
  }
  ${({ type, hoverColor }) => type === 'close' && (
  `
    :focus, :hover {
      box-shadow: 
      inset -4.6em 0 0 0 ${ hoverColor },
      inset 4.6em 0 0 0 ${ hoverColor }; 
    }
    `
  )}
  ${({ type, hoverColor }) => type === 'raise' && (
  `
    :focus, :hover {
      box-shadow: 0 0.5em 0.5em -0.4em ${ hoverColor };
      transform: translateY(-0.25em); 
    }
    `
  )}
  ${({ type, hoverColor }) => type === 'slide' && (
  `
    :focus, :hover {
      box-shadow: inset 9.2em 0 0 0 ${ hoverColor };
    }
    `
  )}
  ${({ type, hoverColor, color }) => type === 'offset' && (
  `
    box-shadow: 
      0.3em 0.3em 0 0 ${ color },
      inset 0.3em 0.3em 0 0 ${ color };
    :focus, :hover {
      box-shadow: 
        0 0 0 0 ${ hoverColor },
        inset 6em 3.5em 0 0 ${ hoverColor };
    }
    `
  )}
`;

export default BaseHoverButton;