import React from 'react'

const LoginContext = React.createContext([{}, () => {}]);

const LoginProvider = (props) => {
  const [state, setState] = React.useState(props.defaultValue);
  return (
    <LoginContext.Provider value={[state, setState]}>
      {props.children}
    </LoginContext.Provider>
  );
}

export { LoginContext, LoginProvider };