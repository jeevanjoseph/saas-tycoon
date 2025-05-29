function PlayerStats(cash = 5000, 
                    customers = 2, 
                    infrastructureCost = 500, 
                    features = [], 
                    skills = { legacy: 1, cloudNative: 0 }, 
                    opsMaturity = 1, 
                    techDebt = 2, 
                    revenue = 0) {
    this.cash = cash;
    this.customers = customers;
    this.infrastructureCost = infrastructureCost;
    this.features = features;
    this.skills = skills;
    this.opsMaturity = opsMaturity;
    this.techDebt = techDebt;
    this.revenue = revenue;
}

module.exports = PlayerStats;