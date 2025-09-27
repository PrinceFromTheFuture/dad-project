

// Configuration constants
export const CONFIG = {
  colors: {
    primary: "#4B5947",
    secondary: "#F3F5F3",
    border: "#C7D9C3",
    background: "#F8F7F7",
    textSeconday:"#777F74"
  },
  dimensions: {
    page: { width: 2100, height: 2970 },
    featureMargin: 43,
    mainContentSideMargin: 120,
    mainContentTopMargin: 200,
    borderHeight: 3,
    innerWidth: 1860,
    innerBoxMargin: 20,
    titleBoxWidth: 580,
    contentBoxWidth: 1100,
  },
  font: {
    regular: "./calibri-regular.ttf",
    bold: "./calibri-bold.ttf",
    sizes: { regular: 36, large: 48 },
  },
  logo: {
    path: "./icons/logo.png",
    width: 200,
  },
} as const;
