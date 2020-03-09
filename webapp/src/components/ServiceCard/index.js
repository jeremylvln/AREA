import React from "react";
import './ServiceCard.css';

function ServiceCard(props) {
  return(
    <div className='container'>
      <div className='card'>
        <div className='face above'>
          <div className='content'>
            {props.cover}
          </div>
        </div>
        <div className='face under'>
          <div className='content'>
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;