import PremiumVersionA from './PremiumVersionA';
import PremiumVersionB from './PremiumVersionB';
import PremiumVersionC from './PremiumVersionC';

export const DIRECTION_COMPONENTS = {
  cinematic: PremiumVersionA,
  editorial: PremiumVersionB,
  mission:   PremiumVersionC,
  // Aliases for backward-compat with any stored localStorage values
  aerospace: PremiumVersionA,
  rflab:     PremiumVersionB,
  engineering: PremiumVersionC,
};
