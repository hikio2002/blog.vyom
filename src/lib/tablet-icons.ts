import {
  PenTool, Wallet, Crown, Palette, Star, Zap, Award, Pencil,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  PenTool, Wallet, Crown, Palette, Star, Zap, Award, Pencil,
};

export function getTabletCategoryIcon(name?: string): React.ComponentType<LucideProps> {
  return (name && ICON_MAP[name]) || PenTool;
}
