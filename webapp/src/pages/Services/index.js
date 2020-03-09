import React from 'react';

import {
  ServiceContainer
} from './style';

import {useHistory} from 'react-router-dom';
import ServiceCard from '../../components/ServiceCard';
import Header from '../../components/Header'
import ButtonSnake from '../../components/ButtonSnake';
import CircularProgress from "@material-ui/core/CircularProgress";

import {API, BACK_ADDRESS} from "../../constants";
import AppBar from "../../components/AppBar";

function Services() {
  const history = useHistory();
  const [state, setState] = React.useState({
    items: undefined,
    resolve: false
  });
  const [open, setOpen] = React.useState({
    epitech: false,
    free: false
  });


  React.useEffect( () => {
    try {
      checkAuth();
    } catch (e) {
      console.log(e);
      history.push('/');
    }
    return () => {};
  });

  const checkAuth = async () => {
    try {
      console.log('Verifying auth');
      const response = await API.get(`/auth/me`);
      console.log(response);
    } catch (e) {
      console.log(e);
      history.push('/');
    }
  };

  const openModal = (id) => {
    let newOpen = {...open};
    newOpen[id] = true;
    setOpen(newOpen);
  }

  const closeModal = (id) => {
    let newOpen = {...open};
    newOpen[id] = false;
    setOpen(newOpen);
    callAPI();
  }

  const callAPI = async () => {
    try {
      const response = await API.get('/auth/linkstate');
      setState({
        items: response.data.services,
        resolve: true
      });
    } catch (e) {
      console.log(e.message);
    }
  };

  const getServices = () => {
    callAPI();
    return (<CircularProgress color="secondary" />);
  };

  const feedLogo = (name) => {
    switch (name) {
      case 'GitHub': return require('../../assets/GitHub.svg');
      case 'Facebook': return require('../../assets/Facebook.png');
      case 'Google': return require('../../assets/Google.png');
      case 'Twitter': return require('../../assets/Twitter.png');
      case 'Azure': return require('../../assets/Azure.png');
      case 'Epitech' : return require('../../assets/Epitech.png');
      case 'Free': return require('../../assets/Free.png');
      case 'Discord': return require('../../assets/Discord.png');
      case 'Slack': return require('../../assets/Slack.png');
      case 'Microsoft-To-Do': return require('../../assets/Microsoft-Todo.png');
      default:
        console.log("Can't find asset of service : ", name);
        return require('../../assets/logo.svg');
    }

  };

  const feedCover = (el) => {
    const logo = feedLogo(el.name);
    return (
      <div>
        <img src={ logo } alt='logo' style={{color: "white"}}/>
        <h3>{el.name}</h3>
      </div>
    );
  };

  let index = 0;
  const createElement = (el) => {
    return (
      <ServiceCard key={index++} cover={feedCover(el)}>
        { el.connected ?
          <ButtonSnake title='Already Connected'/>
          :
          ( el.kind === "external" ?
          <ButtonSnake title='Connect' href={BACK_ADDRESS + el.url}/>
          :
          <ButtonSnake title='Connect' gotModal
            handleOpen={() => {openModal(el.id)}}
            handleClose={() => {closeModal(el.id)}}
            open={open[el.id]}
            inputs={el.inputs}
            url={el.url}
          />)
        }
      </ServiceCard>
    );
  };

  return (
    <>
    <Header/>
    <AppBar/>
      <ServiceContainer>
        {state.resolve ?
          state.items.map((el) => createElement(el)) :
          getServices()
        }
      </ServiceContainer>
    </>
  );
}

export default Services;