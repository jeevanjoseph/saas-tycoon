function PlayerStats(cash = 5000,
    customers = 2,
    legacySkills = 0,
    cloudNativeSkills = 0,
    opsMaturity = 1) {
    this.cash = cash;
    this.customers = customers;
    this.legacySkills = legacySkills;
    this.cloudNativeSkills = cloudNativeSkills;
    this.opsMaturity = opsMaturity;
}

module.exports = PlayerStats;