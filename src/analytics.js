import ReactGA from 'react-ga';

const TRACKING_ID = "G-S9CN7SC3T9"; // Substitua pelo seu ID de rastreamento
ReactGA.initialize(TRACKING_ID);

export const logPageView = () => {
  ReactGA.set({ page: window.location.pathname });
  ReactGA.pageview(window.location.pathname + window.location.search);
};
