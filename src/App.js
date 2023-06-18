import React, { useState, useEffect } from 'react';
import { useApolloClient, gql } from '@apollo/client';
import OwnerCard from './OwnerCard';
import './App.css';

const TOKENS = gql`
  query Tokens($collectionAddr: String, $limit: Int, $offset: Int) {
    tokens(collectionAddr: $collectionAddr, limit: $limit, offset: $offset) {
      tokens {
        name
        owner
        tokenId
        traits {
          name
          value
        }
        media {
          url
        }
        rarityOrder
      }
    }
  }
`;

const WALLET = gql`
  query Wallet($address: String!) {
    wallet(address: $address) {
      address
      name {
        name
      }
    }
  }
`;

function TokensList() {
  const client = useApolloClient();
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTokens = async () => {
      let offset = 0;
      const limit = 100;
      let newTokens = [];

      while (true) {
        try {
          const { data } = await client.query({
            query: TOKENS,
            variables: { collectionAddr: "stars1dpu585ulzzgnr352svgkuqfqf0pe3utg3txlj7smzzawc9dx2d5qpl9t36", limit, offset },
          });

          newTokens = [...newTokens, ...data.tokens.tokens];
          offset += limit;

          if (data.tokens.tokens.length < limit) {
            break;
          }
        } catch (err) {
          setError(err);
          break;
        }
      }

      const ownerCounts = newTokens.reduce((counts, token) => {
        let totalAttributes = 0;
      
        let totalInfluence = 0;
        let totalPrestige = 0;
        let totalAuthority = 0;
        let totalResourcefulness = 0;
      
        for(let trait of token.traits){
          let traitValue = Number(trait.value);
          if(!isNaN(traitValue) && !trait.value.toString().startsWith('#')){
            // Add to individual attribute totals
            if(trait.name === 'Influence'){
              totalInfluence += traitValue;
            } else if(trait.name === 'Prestige'){
              totalPrestige += traitValue;
            } else if(trait.name === 'Authority'){
              totalAuthority += traitValue;
            } else if(trait.name === 'Resourcefulness'){
              totalResourcefulness += traitValue;
            }
          }
        }
      
        totalAttributes = totalInfluence + totalPrestige + totalAuthority + totalResourcefulness;
      
        if (counts[token.owner]) {
          counts[token.owner].count++;
          // Update if the current token has a higher totalAttributes
          if (!counts[token.owner].maxAttributes || counts[token.owner].maxAttributes < totalAttributes) {
            counts[token.owner].rarityOrder = token.rarityOrder;
            counts[token.owner].imageUrl = token.media.url;
            counts[token.owner].maxAttributes = totalAttributes;
          }
      
          counts[token.owner].totalInfluence += totalInfluence;
          counts[token.owner].totalPrestige += totalPrestige;
          counts[token.owner].totalAuthority += totalAuthority;
          counts[token.owner].totalResourcefulness += totalResourcefulness;
          counts[token.owner].totalAttributes += totalAttributes;
      
        } else {
          counts[token.owner] = {
            count: 1,
            rarityOrder: token.rarityOrder,
            imageUrl: token.media.url,
            maxAttributes: totalAttributes,
            totalAttributes: totalAttributes,
            totalInfluence: totalInfluence,
            totalPrestige: totalPrestige,
            totalAuthority: totalAuthority,
            totalResourcefulness: totalResourcefulness,
          };
        }
        return counts;
      }, {});
      
      
      const uniqueOwners = Object.keys(ownerCounts);
      const ownerNames = await Promise.all(uniqueOwners.map(async (owner) => {
        const { data } = await client.query({
          query: WALLET,
          variables: { address: owner },
        });
      
        return {
          address: owner,
          name: data.wallet.name ? data.wallet.name.name : null,
          imageUrl: ownerCounts[owner].imageUrl,
          count: ownerCounts[owner].count,
          totalAttributes: ownerCounts[owner].totalAttributes,  // Include totalAttributes here
          maxAttributes: ownerCounts[owner].maxAttributes,  // and any other properties you need
          rarityOrder: ownerCounts[owner].rarityOrder,
          totalPrestige: ownerCounts[owner].totalPrestige,
          totalAuthority: ownerCounts[owner].totalAuthority,
          totalInfluence: ownerCounts[owner].totalInfluence,
          totalResourcefulness: ownerCounts[owner].totalResourcefulness,
        };
      }));

      setOwners(ownerNames);
      setLoading(false);
    };

    fetchTokens();
  }, [client]);

  const categoryOrder = ['Brigadier', 'Commander', 'Major', 'Captain', 'Lieutenant', 'Enforcer', 'Sergeant', 'Corporal', 'Private'];
  
  const categories = owners.reduce((groups, owner) => {
    const category = owner.count >= 56 ? 'Brigadier' :
                     owner.count >= 41 ? 'Commander' :
                     owner.count >= 32 ? 'Major' :
                     owner.count >= 23 ? 'Captain' :
                     owner.count >= 17 ? 'Lieutenant' :
                     owner.count >= 12 ? 'Enforcer' :
                     owner.count >= 9 ? 'Sergeant' :
                     owner.count >= 4 ? 'Corporal' :
                     'Private';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(owner);
    return groups;
  }, {});

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return (
    <div className="pageContainer">
  <div className="header">
  <a href="https://squad.inhabitants.zone/" target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', top: 0, right: 40 }}>
      <h5>Squad Matrix</h5>
    </a>
    <center><h1>Ladder of Power</h1>
    <h3>Factions Frontier - Mastering In/habitants Metropolis</h3></center>
    <br></br>
  </div>
  <div className="body">
    {categoryOrder.map(category =>
      categories[category] && (
        <div className="categorySection" key={category}>
          <div className="categoryHeader">{category}</div>
          <div className="ownerGrid">
            {categories[category]
              .sort((a, b) => b.totalAttributes - a.totalAttributes)
              .map(owner => (
                <OwnerCard key={owner.address} owner={owner} />
              ))}
          </div>
        </div>
      )
    )}
  </div>
  <div className="footer">
    <center><p>Made with ♥️ by <a href="https://inhabitants.zone/" target="_blank" rel="noopener noreferrer">inhabitants.zone</a></p></center>
  </div>
</div>
    
  );

}

export default TokensList;
