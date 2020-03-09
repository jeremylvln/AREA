import React from "react";
import BaseAppBar from "./style";
import HoverButton from "../HoverButton";
import {Link} from "react-router-dom";
import {theme} from "../../utils/theme";
import {API} from '../../constants';
import {useHistory} from 'react-router-dom';

function AppBar(props) {
  const history = useHistory();

  async function disconnect() {
    console.log("logout");
    await API.post(`/auth/logout`, {});
    history.push('/');
  }

  return (
    <BaseAppBar {...props}>
      <Link to={'/home'}>
        <HoverButton text={'Home'} type={'pulse'} hoverTextColor={theme.inverted_neutral}/>
      </Link>
      <Link to={'/services'}>
        <HoverButton text={'Services'} type={'pulse'} hoverTextColor={theme.inverted_neutral}/>
      </Link>
      <a href={'/client.apk'} download>
        <HoverButton text={'Download'} type={'pulse'} hoverTextColor={theme.inverted_neutral}/>
      </a>
      <HoverButton onClick={disconnect} text={'Log out'} type={'pulse'} hoverTextColor={theme.inverted_neutral}/>
    </BaseAppBar>
  );
};

export default AppBar;