import React from "react";
import loginImg from "../../assets/login.svg";
import {LoginContext} from "../../context/LoginContext";
import Popup from "../Popup";
import {API, BACK_ADDRESS} from "../../constants";

export function Register(props) {
  const [state, setState] = React.useContext(LoginContext);
  const [popup, setPopup] = React.useState({
    open: false,
    message: undefined
  });


  const handleChange = (inputType) => event => {
    if (inputType === "email") {
      setState({ ...state, email: event.target.value });
    } else if (inputType === "passwd") {
      setState({ ...state, passwd: event.target.value });
    }
  };

  const handleSubmit = async (event) => {
    try {
      const response = await API.post('/auth/register',{
        email: state.email,
        password: state.passwd,
        firstname: '',
        lastname: ''
      });
      console.log(response);
      setPopup({
        open: true,
        message: 'successfully registered'
      });
    } catch (e) {
      try {
        console.log(e.response);
        setPopup({
          open: true,
          message: e.response.data.error.more
        });
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setPopup({
      open: false,
      message: undefined
    });
  };

  return (
    <div className="base-container" ref={props.containerRef}>
      <div className="header">Register</div>
      <div className="content">
        <div className="image">
          <img src={loginImg} alt='login'/>
        </div>
        <div className="form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="text" name="email" placeholder="Email" onChange={handleChange("email")}/>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" placeholder="Password" onChange={handleChange("passwd")}/>
          </div>
        </div>
      </div>
      <div className="footer">
        <button type="button" className="btn" onClick={handleSubmit}>
          Register
        </button>
      </div>
      <Popup/>
      <div className='logoTiers'>
        <span className='listLogo'>
          <a href={ BACK_ADDRESS + '/auth/google'}>
            <img src={ require('../../assets/Google.png') } alt={'Google'}/>
          </a>
          <a href={ BACK_ADDRESS + '/auth/facebook'}>
            <img src={ require('../../assets/Facebook.png') } alt={'Facebook'}/>
          </a>
          <a href={ BACK_ADDRESS + '/auth/azuread'}>
            <img src={ require('../../assets/Azure.png') } alt={'Twitter'}/>
          </a>
          <a href={ BACK_ADDRESS + '/auth/github'}>
            <img src={ require('../../assets/GitHub.svg') } style={{ backgroundColor: '#303030' }}  alt={'GitHub'}/>
          </a>
        </span>
      </div>
      <Popup open={popup.open} onClose={handleClose} message={popup.message}/>
    </div>
  );
}
