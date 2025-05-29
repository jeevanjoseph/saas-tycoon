# Service ownership game

The game is like a turn based strategy game. Each player represents a team that is building a SaaS service that has features that drive revenue, infra costs to run, tech debt to manage, operational maturity to develop and staff skills to build. The goal is to make the most money or be most profitable at the end of the game. 

## How the game is played

The players first choose a class. Each class gives them strengths and weaknesses. 3 Classes are available. Monolith, Single tenant microservice and multi tenant micro service. Once the players choose thier classes, the game can begin.  

At each turn, the players make an action (see actions). Actions are at the discretion of the player and once a player has chosen an action that action for the turn in final. When all players have made their actions, an event occurs (See Events). Events affect all teams. Events affect the stats for each player differently based on the skills, operational maturity and the features they have. Once the event adjusts the stats, the revenue for each team is generated. The revenue depends on the class and features. This concludes a single turn in the game. At the end of each turn, revenue is generated based on player stats (See Player Stats). 

## Player Stats

Player Stats are tracked per player. Every action and event impact the player stats. The combined effect of these stats modify the revenue generated in each turn.
The goal for the players to to manage their resources so that they can maintain favorable stats throughout the game.

### Stats
 - Cash on hand [current cash]
 - Number of customers [Revenue = sum(feature_revenue) ]
 - Features
    - arch [Monolith, Single Tenant Microservice, Multi tenant Microservice] (affects the featureRevenue model)
    - featureDevCost (cost to build a new feature, dependent on architecture monolith = 1000,  singletenantMicroService = 1500, multitenantMicroservice = 2000 for CP +1500 for service)
    - techDebt (affects incident response/bug fixes)
    - featurePrice (what you charge for the feature)
    - infraCost (infra cost per feature)
    - featureRevenue = singleTeanant ? numCustomers * (featurePrice-infraCost) : (numCustomers * featurePrice) - (infraCost + numCustomers*.05*infraCost) 
 - Skills 
    - Legacy Skills (required for building legacy services)
    - Cloud Native Skills (required for building microservices)
 - Operational Maturity (improved operational maturity means less loss of revenue due to incidents)


### Classes
Players choose a class to start the game that sets the initial player stats.
 
####  Monolith
 - Cash on hand : 5000
 - Number of customers : 2
 - Features
   - Feature 1
        - Arch [Monolith]
        - techDebt = techDebt + .5
        - featurePrice = 1000
        - infraCost (500)
        - featureRevenue = numCustomers * (featurePrice-infraCost) 
    - Feature 2
        - Arch [Monolith]
        - techDebt = techDebt + .5
        - featurePrice = 1000
        - infraCost (500)
        - featureRevenue = numCustomers * (featurePrice-infraCost) 
    - Feature 3
        - Arch [Monolith]
        - techDebt = techDebt + .5
        - featurePrice = 1000
        - infraCost (500)
        - featureRevenue = numCustomers * (featurePrice-infraCost) 
    - Feature 4
        - Arch [Monolith]
        - techDebt = techDebt + .5
        - featurePrice = 1000
        - infraCost (500)
        - featureRevenue = numCustomers * (featurePrice-infraCost) 
 - Skills 
    - Legacy Skills : 1
    - Cloud Native Skills : 0 
 - Operational Maturity : 1

#### Single tenant micro service

 - Cash on hand 5000
 - Number of customers 2
 - Features
    - arch [Single Tenant Microservice] 
    - techDebt = 0 for first 4 turns,  techDebt + techDebt* 0.1 (10% techDebt increase per turn)
    - featurePrice 1500
    - infraCost (500)
    - featureRevenue = singleTeanant ? numCustomers * (featurePrice-infraCost) : (numCustomers * featurePrice) - (infraCost + numCustomers*.05*infraCost) 
 - Skills 
    - Legacy Skills : 1
    - Cloud Native Skills : 1
 - Operational Maturity : 1


#### Multi tenant micro service. 
The multitenant microservice class has to build a control plane in the first turn, they do not get a choice.
 - Cash on hand 5000
 - Number of customers 2
 - Features
   - Control Plane
        - arch [Multi Tenant Control Plane] 
        - techDebt = 0 for first 8 turns,  techDebt + techDebt* 0.1 (10% techDebt increase per turn)
        - featurePrice 2000 
        - infraCost (800)
        - featureRevenue = 0
   - Feature 1
        - arch [Multi Tenant Microservice] 
        - techDebt = 0 for first 8 turns,  techDebt + techDebt* 0.1 (10% techDebt increase per turn)
        - featurePrice 1500
        - infraCost (500)
        - featureRevenue = (numCustomers * featurePrice) - (infraCost + numCustomers*.05*infraCost) 
 - Skills 
    - Legacy Skills : 0
    - Cloud Native Skills : 2
 - Operational Maturity : 2


## Actions -   (Players make an actions each turn)
——
- Build New Feature
    - Pay feature cost
    - Roll 2 dice (or a 12 sided dice). Roll (8 - SkillPoints) for feature development to be successful. (invest in training for better success)
    - Cost of building a new feature depends on tech debt. Every techDebt points are percentages, and FeatureCost = 1000+ (10*techDebt)
    - Feature revenue is only available in the next turn.
- Invest in Tooling
    - Improves operational maturity +1
    - Cost is 2000
    - See Tooling skill tree for bonuses that can be unlocked
- Skill Development
    - Cloud Native - Cost 2000
    - Legacy - Cost 1500
    - +1 for Skill. Decreases feature failure odds.
    - Teams that start out in one class need to develop skills to build features of a different class. 
- Retire a feature
    - Retire a Feature. Lose the revenue, techDebt and cost.
    - Roll Dice for penalty
        - Roll 6 or lower. Customers unhappy about feature loss. Revenue halved for this turn.
        - above 6. Still generate revenue from other features.  
- Reduce techDebt
    - Invest in reducing tech debt. 
    - Cost 500, per .5 techDebt
- Increase Feature price
    - Max 500.
    - Boost revenue.

During each turn there is an event. Events affect all teams , but based on class will have different outcomes. 

## Events 

Incidents, (roll dice for severity)
    - Roll 1 dice. 
    - Lose revenue. (100 - roll*10) percentage of revenue is lost
    - Each level of opertional maturiy reduces the severity by 1 

Market shifts 
    - Increased competition. Reduce the price of a feature or lose a customer
        - Roll dice. Roll larger than 6, reduce price by 1000, Roll 6 or less, reduce the price by 500
    - New compliance requirements
        - Need to patch all existing features to meet new requirements. Lose 500 per feature
        - If techDebt for  feature is > 4, lose all revenue from feature
Customer Opportunity
    - Build a feature to get a bonus 1000

Talent challenges (increased churn in the team)
    - Burnout
        - Operational Maturity affects how teams can effectively handle the day to day service ownership
        - Roll dice. Subtract operational maturity points from roll.  If the result is lower than 6, lose a skill point
    - Career Progression
        - Developers want to stay relevant. A team that has heavy tech debt and legacy technology affects career growth and opportunities.
        - Roll dice. Add tech debt(rounded up) to the roll. If the result is larger than 6 lose a skill point. 


## Skill Trees


Observability 
    - level 1 - build using dashboards for troubleshooting (operational maturity +5 )
    - level 2 applications emit custom metrics and traces. (operational maturity +5 )
    - level 3 - implement alerts (operational maturity +10)
    - level 4 - Predict a failure ( operational maturity +10, next incident has no effect)

Automation

- Level 1 - Adopt Terraform - (expertise +5)
- Level 2 - Implement 
- Level 3 - automated run books (requires operational runbooks)

Service Excellence 

- Operational run books 
- Create an SRE Org 
- Implement a weekly Ops call
- 
- Implement a CAPA process

Training

- Level 1 - micro services 
- Level 2 - build stateless applications
- Level 3 - application resiliency
- Level 4 - auto scaling
- Level 5 - 

