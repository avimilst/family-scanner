// Family Scanner Color Palette
// Deep blue for trust/safety, warm accents for family-friendly feel

export const Colors = {
  // Primary Colors
  primary: '#1e3a5f',      // Deep blue - trust, safety
  primaryLight: '#2d5a8a', // Lighter blue
  primaryDark: '#142942',  // Darker blue

  // Accent Colors
  accent: '#f5a623',       // Warm orange - family-friendly
  accentLight: '#ffc857', // Light yellow-orange
  accentDark: '#d4850d',  // Darker orange

  // Background Colors
  background: '#f5f8fa',   // Soft off-white/light blue
  backgroundCard: '#ffffff',
  backgroundDark: '#e8eef3',

  // Text Colors
  textPrimary: '#1a1a2e',
  textSecondary: '#4a5568',
  textLight: '#718096',
  textWhite: '#ffffff',

  // Category Colors (for content findings)
  categoryViolence: '#e53e3e',      // Red
  categorySexual: '#ed8936',         // Orange
  categoryLGBTQ: '#9f7aea',          // Purple
  categoryScary: '#4a5568',          // Dark gray
  categoryReligious: '#3182ce',      // Blue

  // Status Colors
  success: '#38a169',
  warning: '#dd6b20',
  error: '#e53e3e',

  // UI Colors
  border: '#e2e8f0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

// Category configuration with colors and labels
export const Categories = {
  violence: {
    color: Colors.categoryViolence,
    label: 'Violence',
    icon: '●',
  },
  'sexual content': {
    color: Colors.categorySexual,
    label: 'Sexual Content',
    icon: '●',
  },
  'lgbtq+ characters/themes': {
    color: Colors.categoryLGBTQ,
    label: 'LGBTQ+ Themes',
    icon: '●',
  },
  'scary content': {
    color: Colors.categoryScary,
    label: 'Scary Content',
    icon: '●',
  },
  'religious affiliation/themes': {
    color: Colors.categoryReligious,
    label: 'Religious Themes',
    icon: '●',
  },
};

// Helper function to get category config
export const getCategoryConfig = (category) => {
  const normalizedCategory = category.toLowerCase();
  return Categories[normalizedCategory] || {
    color: Colors.textSecondary,
    label: category,
    icon: '●',
  };
};
