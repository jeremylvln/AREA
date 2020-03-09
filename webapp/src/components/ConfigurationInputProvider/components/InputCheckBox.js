import React, {useState} from 'react';
import {func, object} from "prop-types";
import {theme} from "../../../utils/theme";
import Checkbox from "@material-ui/core/Checkbox";
import {createMuiTheme} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";

const Materialtheme = createMuiTheme({
  palette: {
    primary: {
      main: theme.primary
    },
    secondary: {
      main: theme.secondary
    },
  },
  status: {
    danger: 'orange',
  },
});

function InputCheckBox(props) {
  const { input, state, onChange } = props;
  const [value, setValue] = useState(state.value);

  const handleChange = (event) => {
    setValue(event.target.checked);
    onChange({ value: event.target.checked, name: input.name });
  };

  return (
    <ThemeProvider theme={Materialtheme}>
      <FormControlLabel
        control={
          <Checkbox checked={value} onChange={handleChange} color="primary"/>
        }
        label={input.formId}
      />
    </ThemeProvider>
  );
}
InputCheckBox.PropsType = {
  input: object.isRequired,
  state: object.isRequired,
  onChange: func.isRequired,
};

export default InputCheckBox;