import styled from 'styled-components';

export const Card = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 15px;
  width: 22.5vw;
  height: 10vh;
`;

export const Title = styled.p`
  color: black;
  margin-left: 10px;
  font-size: 22px;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 10vh;
  width: 8vw;
`;