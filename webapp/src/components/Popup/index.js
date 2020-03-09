import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';



export default function Popup(props) {
  return (
    <div>
      <Snackbar
        anchorOrigin={{
          vertical: (props.vertical || 'bottom'),
          horizontal: props.horizontal || 'center',
        }}
        open={props.open}
        autoHideDuration={props.autoHideDuration || 3000}
        onClose={props.onClose}
        ContentProps={{
          'aria-describedby': 'message-id',
        }}
        message={<span id="message-id">{(props.message || "")}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            className={'close'}
            onClick={props.onClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    </div>
  );
}