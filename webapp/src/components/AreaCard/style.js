import styled from 'styled-components';

export const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 80px;
  width: 24vw;
  background-color: white;
  border-radius: 5px;
  margin: 2%;
  margin-left: 0%;
`;

export const Icon = styled.img`
  max-width: 50px;
  height: auto;
  width: auto;
  margin: 2%;
  margin-top: 3%;
`;

export const TextContainer = styled.div`
  margin-top: -2%;
`;

export const Title = styled.p`
  font-size: 22px;
`;

export const Description = styled.p`
  font-size: 14px;
  margin-top: -5%;
  color: grey;
`;