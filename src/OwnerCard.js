import React from 'react';
import './App.css';

function formatAddress(address) {
  return `${address.slice(0, 8)}...${address.slice(-5)}`;
}

function OwnerCard({ owner }) {
  const { 
    address, 
    name, 
    imageUrl, 
    count,
    totalAttributes, 
    totalPrestige,
    totalAuthority,
    totalInfluence,
    totalResourcefulness
  } = owner;
  const formattedAddress = formatAddress(address);

  let rank;
  if (count >= 56) {
    rank = 'Brigadier';
  } else if (count >= 41) {
    rank = 'Commander';
  } else if (count >= 32) {
    rank = 'Major';
  } else if (count >= 23) {
    rank = 'Captain';
  } else if (count >= 17) {
    rank = 'Lieutenant';
  } else if (count >= 12) {
    rank = 'Enforcer';
  } else if (count >= 9) {
    rank = 'Sergeant';
  } else if (count >= 4) {
    rank = 'Corporal';
  } else {
    rank = 'Private';
  }
  
  const displayName = name || formattedAddress;
  const linkUrl = name ? `https://${name}.stars.page/` : null;
  

  return (
    <div className={`ownerCard ${rank}`}>
      {imageUrl && <img src={imageUrl} alt={displayName} style={{ width: '125px', height: '125px' }} />}
      <p className="main-info">
        {linkUrl ? (
          <a href={linkUrl} target="_blank" rel="noreferrer">
            {displayName}
          </a>
        ) : (
          displayName
        )} : {count}
      </p>
      <div className="additional-info">
      <p className="attributes">Attributes: {totalAttributes}</p>
    
        <p>Prestige: {totalPrestige}</p>
        <p>Authority: {totalAuthority}</p>
        <p>Influence: {totalInfluence}</p>
        <p>Resourcefulness: {totalResourcefulness}</p>
      </div>
    </div>
  );
  
}

export default OwnerCard;
