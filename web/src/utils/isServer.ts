// determine if we are on server or not
// if undefined, we ar eon server. Otherwise, we are on browser
export const isServer = () => typeof window === "undefined";
