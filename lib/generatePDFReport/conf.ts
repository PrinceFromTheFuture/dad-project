import { rgb } from "pdf-lib";

function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return rgb(r, g, b);
}

// Configuration constants
export const CONFIG = {
  colors: {
    primary: hexToRgb("#4B5947"),
    secondary: hexToRgb("#F3F5F3"),
    border: hexToRgb("#C7D9C3"),
    background: hexToRgb("#F8F7F7"),
    textSecondary: hexToRgb("#777F74"),
  },
  dimensions: {
    page: { width: 2100, height: 2970 },
    featureMargin: 43,
    mainContentSideMargin: 120,
    mainContentTopMargin: 200,
    borderHeight: 3,
    innerWidth: 1860,
    innerBoxMargin: 20,
    agentBoxMargin: 50,
    contentBoxWidth: 1100,
  },
  agentDimensions: {
    baseHight: 150,
    operation: 52,
  },
  font: {
    sizes: { regular: 36, large: 48 },
  },
  logo: {
    buffer: `${process.env.NEXT_PUBLIC_URL}/logo.png`,
    width: 262,
    hight: 103,
  },
} as const;
