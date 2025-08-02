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
    title: "Feature Innovation",
    type: "FEATURE_INNOVATION",
    description: "Teams with more than 3 features gain 1 customer as they innovate and improve their feature set.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Operational Excellence",
    type: "OPERATIONAL_EXCELLENCE",
    description: "Teams with more than 5 operational maturity points gain 1 customer as they demonstrate operational excellence.",
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
    title: "Market Disruption",
    type: "MARKET_DISRUPTION",
    description: "A new competitor has entered the market, with a modern tech-stack and a highly skilled team, they are able to offer cloud scale services at a fraction of the cost.  All teams are forced to lower their feature pricing by 10% to compete.",
    turn: 0
  }
];

const midTermEvents = [
  {
    id: uuidv4(),
    title: "Tech Debt Crisis",
    type: "TECH_DEBT_CRISIS",
    description: "Teams with more than 5 tech debt points lose 1 customer due to inability to innovate.",
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
    title: "Legacy Skills Shortage",
    type: "LEGACY_SKILLS_SHORTAGE",
    description: "Teams with more than 5 legacy features, and less than 8 Legacy skill points have their tech debt double as these skills are in shortage, making them expensive to maintain. Consider pivoting to cloud-native solutions.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Feature Bloat",
    type: "FEATURE_BLOAT",
    description: "Teams with more than 5 features and a total tech debt higher than 8 lose 50% revenue for the quarter.",
    turn: 0
  },
  {
    id: uuidv4(),
    title: "Market Saturation",
    type: "MARKET_SATURATION",
    description: "The market is saturated, teams with more than 5 customers and less than 5 Ops Maturity points lose 1 customer as they struggle to maintain service quality.",
    turn: 0
  },
  
];
const longTermEvents = [
  
  {
    id: uuidv4(),
    title: "Regulatory Changes",
    type: "REGULATORY_CHANGES",
    description: "New regulations require all teams to have at least 3 operational maturity points. Teams that did not meet the new regulations lose their quarterly revenue as a fine.",
    turn: 0
  },

  {
    id: uuidv4(),
    title: "Breaking Vendor Lock-in",
    type: "BREAKING_VENDOR_LOCKIN",
    description: "Teams that have raised prices to more than 100% of the original price lose 25% customers as they seek alternatives.",
    turn: 0
  },
  
  {
    id: uuidv4(),
    title: "Customer Experience Revolution",
    type: "CUSTOMER_EXPERIENCE_REVOLUTION",
    description: "Teams with more than 7 operational maturity points and less than 5 total tech debt will gain 2 customers as they revolutionize customer experience.",
    turn: 0
  },
 
  {
    id: uuidv4(),
    title: "Major CVE",
    type: "MAJOR_CVE",
    description: "A major CVE has been discovered, teams with more than 8 tech debt points lose upto  2 customers.",
    turn: 0
  }
];

function getRandomEvent(turn) {
  if (turn <= 9) {
    return getRandomEventFromList(events);
  } else if ( turn > 9 && turn <=15){
    return getRandomEventFromList(midTermEvents);
  } else {
    return getRandomEventFromList(longTermEvents);
  }

  
}

function getRandomEventFromList(list){
   const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

module.exports = {
  getRandomEvent
};