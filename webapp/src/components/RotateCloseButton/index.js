import React from "react";
import BaseRotateCloseButton from "./style";
import {string} from "prop-types";

function RotateCloseButton(props) {
  return (
    <BaseRotateCloseButton {...props}>
      <div className="child1" />
      <div className="child2" />
    </BaseRotateCloseButton>
  );
};
RotateCloseButton.PropsType = {
  size: string
};
RotateCloseButton.defaultProps = {
  size: '100%'
};

export default RotateCloseButton