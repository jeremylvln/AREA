import React from 'react';
import { object, func } from 'prop-types';
import InputText from "./components/InputText";
import InputNumber from "./components/InputNumber";
import InputCheckBox from "./components/InputCheckBox";
import InputSelect from "./components/InputSelect";
import InputRadio from "./components/InputRadio";

function ConfigurationInputProvider(props) {
  if (props.input.kind === "number") return <InputNumber {...props}/>;
  if (props.input.kind === "checkbox") return <InputCheckBox {...props}/>;
  if (props.input.kind === "radiobox") return <InputRadio {...props}/>;
  if (props.input.kind === "select") return <InputSelect {...props}/>;
  return <InputText {...props}/>;
};
ConfigurationInputProvider.PropsType = {
  input: object.isRequired,
  state: object.isRequired,
  onChange: func.isRequired,
};

export default ConfigurationInputProvider;