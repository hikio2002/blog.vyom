import {
  Laptop, Wallet, Crown, Cpu, Gamepad2, Star, Zap, Award, Briefcase, Palette,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Laptop, Wallet, Crown, Cpu, Gamepad2, Star, Zap, Award, Briefcase, Palette,
};

/**
 * Resolve a Lucide icon by name (stored as a string on LaptopCategory).
 * Falls back to Laptop if the name isn't recognized.
 */
export function getLaptopCategoryIcon(name?: string): React.ComponentType<LucideProps> {
  return (name && ICON_MAP[name]) || Laptop;
}
