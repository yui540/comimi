export const maxWidthMediaQuery = (maxWidth: number) =>
  `@media (max-width: ${maxWidth}px)`;

export const minWidthMediaQuery = (minWidth: number) =>
  `@media (min-width: ${minWidth}px)`;

export const minMaxWidthMediaQuery = (minWidth: number, maxWidth: number) =>
  `@media (min-width: ${minWidth}px) and  (max-width: ${maxWidth}px)`;

export const breakPoints = {
  mediumSmall: 767
};

export const mobileViewportQuery = `(max-width: ${breakPoints.mediumSmall}px)`;

export const media = {
  mediumUp: minWidthMediaQuery(breakPoints.mediumSmall + 1),
  smallDown: maxWidthMediaQuery(breakPoints.mediumSmall),
  tablet: minMaxWidthMediaQuery(breakPoints.mediumSmall + 1, 959),
  desktop: minWidthMediaQuery(960)
};
