import React, {useState} from "react";
import PowerIcon from '@material-ui/icons/Power';
import PowerOffIcon from '@material-ui/icons/PowerOff';
import Button from "@material-ui/core/Button";

import {theme} from "../../utils/theme";
import {API} from "../../constants";

function WorkflowPowerButton(props) {
  const [active, setActive] = useState(undefined);
  const {id, enabled} = props;

  const enableWorkflow = async () => {
    try {
      await API.post(`/workflows/${id}/enable`, {
        enabled: !active
      });
      setActive(!active);
    } catch (e) {
    }
  };

  if (active === undefined) {
    setActive(enabled);
  }

  return (
    <Button onClick={() => { enableWorkflow() }}>
      {active === true ? (
        <PowerIcon style={{ color: theme.inverted_neutral }}/>
      ) : (
        <PowerOffIcon style={{ color: theme.inverted_neutral }}/>
      )}
    </Button>
  );
};

export default WorkflowPowerButton
