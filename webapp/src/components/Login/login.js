import React from "react";
import loginImg from "../../assets/login.svg";
import { useHistory } from 'react-router-dom';
import { LoginContext } from "../../context/LoginContext";
import {API, BACK_ADDRESS} from "../../constants";
import Popup from "../Popup";

export function Login(props){
  const [state, setState] = React.useContext(LoginContext);
  const history = useHistory();
  const [popup, setPopup] = React.useState({
    open: false,
    message: undefined
  });

  const handleEnter = (e, target) => {
    if (e.key === 'Enter') {
      if (target === 'passwd') handleSubmit();
    }
  };

  const handleChange = (inputType) => event => {
    if (inputType === "email") {
      setState({ ...state, email: event.target.value });
    } else if (inputType === "passwd") {
      setState({ ...state, passwd: event.target.value });
    }
  };

  const handleSubmit = async (_) => {
    try {
      const response = await API.post('/auth/login',{
        email: state.email,
        password: state.passwd,
        firstname: '',
        lastname: ''
      });
      if (response.status === 200) {
        history.push('/home');
      }
    } catch (e) {
      try {
        setPopup({
          open: true,
          message: "Invalid login or password"
        })
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
      <div className="header">Login</div>
      <div className="content">
        <div className="image">
          <img src={loginImg} alt='login'/>
        </div>
        <div className="form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange("email")}
              onKeyDown={(e) => handleEnter(e, 'email')}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange("passwd")}
              onKeyDown={(e) => handleEnter(e, 'passwd')}
            />
          </div>
        </div>
      </div>
      <div className="footer">
        {/*<Link to='/home'>*/}
          <button type="button" className="btn" onClick={handleSubmit}>
            Login
          </button>
        {/*</Link>*/}
      </div>
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
            <img src={ require('../../assets/GitHub.svg') } style={{ backgroundColor: '#303030' }} alt={'GitHub'}/>
          </a>
        </span>
      </div>
      <Popup open={popup.open} onClose={handleClose} message={popup.message}/>
    </div>
  );
}
