export interface LoyaltyRewardsConfig {
  /**
   * Number of free bonus points/coins awarded upon new user registration / profile creation.
   */
  signupRewardPoints: number;

  /**
   * Cash value in BDT (৳) equivalent to 1 reward point when redeemed.
   * e.g. 1 point = 1.00 BDT
   */
  pointToBdtRate: number;

  /**
   * Amount in BDT required to earn 1 point.
   * e.g. 100 BDT = 1 point (1.0% cash-back rate)
   */
  spendAmountPerPoint: number;

  /**
   * Percentage of completed order amount earned as coins/points on purchases.
   * 100 BDT = 1 point means 1.0%
   */
  purchaseRewardPercentage: number;

  /**
   * Minimum points required before a customer can redeem points at checkout.
   */
  minRedemptionPoints: number;

  /**
   * Maximum percentage of total cart amount that can be paid using points.
   * e.g. 50 = maximum 50% discount from loyalty points, remaining via Cash On Delivery.
   */
  maxRedemptionPercentage: number;
}

export const LOYALTY_CONFIG: LoyaltyRewardsConfig = {
  signupRewardPoints: 20,
  pointToBdtRate: 1.0,
  spendAmountPerPoint: 100,
  purchaseRewardPercentage: 1.0,
  minRedemptionPoints: 20,
  maxRedemptionPercentage: 50,
};
