import React from 'react';
import styled from "styled-components";

const Center = styled.div`
  width: 75px;
  height: 75px;
  color: white;
  position: absolute;
  top: 40%;
  left: 40%;
  transform: translate(-50%, -50%);
`;

function PlayGround() {
  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', backgroundColor: '#666666' }}>
      <Center>
        {/*<RotateCloseButton size={'8vh'}/>*/}
      </Center>
    </div>
  );
}

export default PlayGround;