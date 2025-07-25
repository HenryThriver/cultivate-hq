export interface CardPosition {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
}

export interface PreviewCard {
  type: 'contact' | 'action' | 'goal' | 'voice' | 'timeline';
  position: CardPosition;
  id: number;
}

export const getCardPositions = (): CardPosition[] => [
  // Top left area
  { top: '15%', left: '8%' },
  // Top right area  
  { top: '20%', right: '12%' },
  // Bottom center area (well-spaced for 3-card sequence)
  { bottom: '15%', left: '50%', transform: 'translateX(-50%)' },
  // Additional positions for flexibility
  { bottom: '15%', right: '8%' },
  { bottom: '20%', left: '35%' }
];

export const getResponsiveCardPositions = (screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): CardPosition[] => {
  switch (screenSize) {
    case 'xs':
    case 'sm':
      // Mobile: stack vertically with more spacing
      return [
        { top: '15%', left: '5%', right: '5%' },
        { top: '25%', left: '5%', right: '5%' },
        { top: '35%', left: '5%', right: '5%' },
        { top: '45%', left: '5%', right: '5%' },
        { top: '55%', left: '5%', right: '5%' }
      ];
    case 'md':
      return [
        { top: '18%', left: '8%' },
        { top: '22%', right: '12%' },
        { top: '48%', left: '12%' },
        { bottom: '18%', right: '8%' },
        { bottom: '22%', left: '32%' }
      ];
    default:
      // Large screens: positioned below the Cultivate HQ text to focus attention
      return [
        { top: '60%', left: '15%' },        // Card 1: lower-left
        { top: '65%', right: '18%' },       // Card 2: lower-right
        { top: '70%', left: '25%' },        // Card 3: bottom-left  
        { top: '72%', right: '25%' },       // Card 4: bottom-right
        { top: '75%', left: '35%' }         // Card 5: bottom-center
      ];
  }
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}; 