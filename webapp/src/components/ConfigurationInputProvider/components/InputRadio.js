import React, {useState} from 'react';
import {func, object} from "prop-types";
import {theme} from "../../../utils/theme";
import {createMuiTheme} from "@material-ui/core";
import {ThemeProvider} from "@material-ui/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";

const Materialtheme = createMuiTheme({
  palette: {
    primary: {
      main: theme.primary
    },
    secondary: {
      main: theme.primary
    },
  },
  status: {
    danger: 'orange',
  },
});

function InputRadio(props) {
  const { input, state, onChange } = props;
  const [value, setValue] = useState(state.value);

  const handleChange = (event) => {
    setValue(event.target.value);
    onChange({ value: event.target.value, name: input.name });
  };

  return (
    <ThemeProvider theme={Materialtheme}>
      <FormControl component="fieldset">
        <RadioGroup value={value} onChange={handleChange}>
          {input.choices.map(e => (
            <FormControlLabel key={e.name} value={e.value} control={<Radio />} label={e.name} />
          ))}
        </RadioGroup>
      </FormControl>
    </ThemeProvider>
  );
}
InputRadio.PropsType = {
  input: object.isRequired,
  state: object.isRequired,
  onChange: func.isRequired,
};

export default InputRadio;