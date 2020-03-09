import React from 'react'

const HomeContext = React.createContext([{}, () => {}]);

const HomeProvider = (props) => {
  const [state, setState] = React.useState({
    workflowId: null,
    showBank: true,
    cardInfo: {},
    workflowActions: undefined,
    workflowReactions: undefined
  });

  return (
    <HomeContext.Provider value={[state, setState]}>
      {props.children}
    </HomeContext.Provider>
  );
}

export { HomeContext, HomeProvider };