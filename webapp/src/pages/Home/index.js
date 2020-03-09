import React, {useContext} from 'react';
import { API, BACK_ADDRESS } from "../../constants";

import {
  HomeContainer,
  AreaContainer,
  WorkflowContainer, PageContainer,
} from './style';

import {useHistory} from 'react-router-dom';
import CreateWorkflowButton from '../../components/CreateWorkflowButton';
import AppBar from "../../components/AppBar";
import WorkflowCard from "../../components/WorkflowCard";
import BankContainer from "../../components/BankContainer";
import {HomeContext} from "../../context/HomeContext";
import WorkflowFocus from "../../components/WorkflowFocus";

function Home() {
  const history = useHistory();
  const [state, setState] = React.useState(undefined);
  const [ctx] = useContext(HomeContext);

  React.useEffect( () => {
    if (state)
      return;
    try {
      checkAuth();
    } catch (e) {
      console.log(e);
      history.push('/');
    }
    try {
      checkWorkflow();
    } catch (e) {
      console.log(e);
    }
    return () => {};
  });

  const compare = (a, b) => {
    let nameA = a.name.toUpperCase();
    let nameB = b.name.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  const checkWorkflow = async () => {
    if (state)
      return;
    try {
      const response = await API.get('/workflows');
      setState({ ...state, workflows: response.data.sort(compare) });
    } catch (e) {
      console.log(e);
      setState({ ...state, workflows: [] });
    }
  };

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

  const createNewWorkflow = async () => {
    try {
      const response = await API.post(`${BACK_ADDRESS}/workflows`,
      {
        name: `Workflow n°${state.workflows.length}`
      });
      console.log(response);
      setState({...state, workflows: state.workflows.concat(response.data)})
    } catch(e) {
      console.log(e);
    }
  }

  const removeWorkflow = async (id) => {
    try {
      await API.delete(`/workflows/${id}`);
      const newWorkflowList = state.workflows.filter((elem) => elem.id !== id);
      setState({...state, workflows: newWorkflowList});
    } catch(e) {
      console.log(e);
    }
  }

  const changeFocusedWorkflowName = async (newName) => {
    try {
      await API.put(`/workflows/${ctx.workflowId}`,
      {
        name: newName
      });
      const newWorkflowList = state.workflows.map((elem) => {
        if (elem.id === ctx.workflowId) {
          console.log("found workflow to rename");
          return {
            ...elem,
            name: newName
          }
        } else {
          return elem;
        }
      });
      setState({...state, workflows: newWorkflowList});
    } catch(e) {
      console.log(e);
    }
  }

  const focusedWorkflow = () => {
    try {
      return state.workflows.find(e => e.id === ctx.workflowId).name
    } catch (e) {
      return ""
    }
  };

  return (
    <PageContainer>
        <AppBar />
        <HomeContainer>
          <AreaContainer hide={ctx.workflowId !== null}>
            {(state && state.workflows) &&
              <>
                <WorkflowContainer hide={ctx.workflowId !== null}>
                  {state.workflows.map(e => {
                    return <WorkflowCard key={e.id} id={e.id} title={e.name} data={e} color={'#6a4eb7'} onDelete={() => {removeWorkflow(e.id)}}/>
                  })}
                  <CreateWorkflowButton
                    onClick={createNewWorkflow}
                  />
                </WorkflowContainer>
                <WorkflowFocus
                changeName={changeFocusedWorkflowName}
                show={ctx.workflowId !== null}
                name={focusedWorkflow()}
                />
              </>
            }
          </AreaContainer>
          <BankContainer/>
        </HomeContainer>
    </PageContainer>
  );
}

export default Home;