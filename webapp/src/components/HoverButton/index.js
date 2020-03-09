import React from 'react';
import BaseHoverButton from './style'
import {number, string} from "prop-types";
import {theme} from "../../utils/theme";

function HoverButton(props) {
  const { text } = props;
  return (
    <BaseHoverButton {...props}>{text}</BaseHoverButton>
  );
}
HoverButton.PropType = {
  type: string, // animation Type [fill-in, fill-up, pulse, close, raise, slide, offset]
  color: string, // button color
  hoverColor: string, // on Hover/Focus button color
  text: string, // text on button
  textColor: string, // text color
  hoverTextColor: string, // on Hover/Focus button color
  transition: number, // animation duration in millisecond
  backgroundColor: string,
  height: string,
  width: string
};
HoverButton.defaultProps = {
  type: 'fill-in',
  color: theme.inverted_neutral,
  hoverColor: theme.primary,
  text: 'button',
  textColor: theme.inverted_neutral,
  hoverTextColor: theme.neutral,
  transition: 250,
  backgroundColor: theme.neutral,
  height: '60px',
  width: '150px'
};

export default HoverButton;