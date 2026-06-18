import {
  Camera as CameraIcon, Wallet, Crown, Video, Star, Zap, Award, Aperture,
  type LucideProps,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  Camera: CameraIcon, Wallet, Crown, Video, Star, Zap, Award, Aperture,
};

export function getCameraCategoryIcon(name?: string): React.ComponentType<LucideProps> {
  return (name && ICON_MAP[name]) || CameraIcon;
}
