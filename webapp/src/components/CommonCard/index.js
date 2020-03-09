import React, { useState } from 'react';
import styled from 'styled-components'

import {
  Typography,
  Card,
} from '@material-ui/core';

const LogoIcon = styled.img`
  align-self: center;
  height: 3vh;
  width: 3vh;
  margin-right: 5%;
`;

const HeaderText = styled(Typography)`
  margin: 5%;
`;

const CardHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
  flex-direction: row;
  align-content: center;
  background-color: blue;
`;

const CardBody = styled.div`
  margin: 5%;
`;

export default function CommonCard(props) {
  const {
    title = "Card without title",
    description = "no description given",
    type = "action"
  } = props;

  const [dragged, setDragged] = useState(true);
  const logoName = type === "action" ? 'ActionLogo.png' : 'ReactionLogo.png';

  return (
    <Card draggable
     onDragStart={() => setDragged(false)}
     onDragEnd={() => setDragged(true)}
     style={{width: "13%", margin: "1%", opacity: dragged ? 1 : 0.2}}>
      <CardHeader>
        <HeaderText>{title}</HeaderText>
        <LogoIcon src={require(`../../assets/${logoName}`)} alt='icon' />
      </CardHeader>
      <CardBody>
        <Typography>{description}</Typography>
      </CardBody>
    </Card>
  );
}