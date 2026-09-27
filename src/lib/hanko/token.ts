/** The official $HANKO token. This is the only place the address is written;
 *  every surface on the site reads it from here. */
export const HANKO_TOKEN = {
  symbol: "$HANKO",
  ca: "dw3hRmgybQPvHyp9Bfdu9gQyB1uP2fSHes37CsQMory",
} as const;

export const HANKO_TOKEN_EXPLORER = `https://solscan.io/token/${HANKO_TOKEN.ca}`;

/** "dw3hRm…Mory": enough to recognise it, full value is always one copy away. */
export const shortCA = (ca: string = HANKO_TOKEN.ca) => `${ca.slice(0, 6)}…${ca.slice(-4)}`;
