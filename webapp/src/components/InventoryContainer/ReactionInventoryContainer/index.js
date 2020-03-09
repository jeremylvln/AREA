import React, { useState } from 'react';
import { API, BACK_ADDRESS } from '../../../constants';

import AreaCard from '../../AreaCard';

import {
  Line
} from './style'

export default function ReactionInventoryContainer() {

  const [reactionArray, setReactionArray] = useState(undefined);

  function compare(a, b) {
    let nameA = a.service.toUpperCase();
    let nameB = b.service.toUpperCase();

    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  async function getAvailableReaction() {
    const response = await API.get(`/auth/linkstate`);
    const { services: authorizedServices} = response.data;
    const { data } = await API.get(`${BACK_ADDRESS}/modules/reactions`);
    const reactionArray = data.filter((elem) => {
      for (let service of authorizedServices) {
        if (elem.authTokenProvider === service.id && !service.connected) {
          return false;
        }
      }
      return true;
    }).sort(compare);
    setReactionArray(reactionArray);
  }

  let lastService = "";
  const checkLastService = (service) => {
    if (service !== lastService) {
      lastService = service;
      return "boucher";
    } else {
      return "vegan";
    }
  }


  if (reactionArray === undefined) {
    getAvailableReaction();
    return <></>;
  }

  let index = 0;
  return (
    <div style={{display: "flex", flexDirection: "column", overflow: "hidden"}}>
      <p style={{color:"white", fontSize:"28px"}}>Reactions</p>
      {reactionArray ? reactionArray.map((elem) =>
        <React.Fragment key={index++}>
          {checkLastService(elem.service) !== "boucher" ?
            <></>
            :
            <>
            <h2 style={{color: "white", textTransform: "capitalize"}}>{elem.service}</h2>
            <Line/>
            </>
          }
          <AreaCard
            id={elem.id}
            areaType="reaction"
            serviceType={elem.service}
            title={elem.name}
            description={elem.description}
            form={elem.form}
          />
        </React.Fragment>
      )
    :
    <></>
    }
    </div>
  );
}

