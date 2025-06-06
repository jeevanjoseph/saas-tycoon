const { v4: uuidv4 } = require('uuid');

const events = [
 
  {
    id: uuidv4(),
    title: "OSSP Lighthouse Program",
    type: "LIGHTHOUSE_PROGRAM",
    description: "Each team gains +1 operational maturity from the OSSP Lighthouse Program.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Customer Churn",
    type: "CUSTOMER_CHURN",
    description: "Technical debt makes it hard to deliver new features and innovate. Teams with features having more than 4 tech debt points lose 1 customer.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Cloud Migration",
    type: "CLOUD_MIGRATION",
    description: "Customers are modernizing the software they use. Teams with more cloud native features than legacy features gain 1 customer.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Major Incident",
    type: "DOWNTIME",
    description: "All systems fail, but teams with higher operational maturity can limit the damage. You are required to pay the customer a fine dependent on your operational maturity gap.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Rapid Innovation",
    type: "INNOVATION",
    description: "Highly skilled teams (both legacy or cloud native) with more than 5 skill points gain a customer.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Rising Costs",
    type: "RISING_COSTS",
    description: "Economic conditions have forced infrastructure costs to rise. Infrastructure costs increase by 20% for all teams.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Market Disruption",
    type: "MARKET_DISRUPTION",
    description: "A new competitor has entered the market, with a modern tech-stack and a highly skilled team, they are able to offer cloud scale services at a fraction of the cost.  All teams are forced to lower their feature pricing by 10% to compete.",
    turn: 0
  }
];

function getRandomEvent() {
  const randomIndex = Math.floor(Math.random() * events.length);
  return events[randomIndex];
}

module.exports = {
  getRandomEvent
};