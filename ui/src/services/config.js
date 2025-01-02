const valueConfig = {
  db: process.env.DB ? process.env.DB : '',
  baseUrl: process.env.BASE_URL ? process.env.BASE_URL : '',
  mainUrl: process.env.MAIN_URL ? process.env.MAIN_URL : '',
  apiUrl: process.env.API_URL ? process.env.API_URL : '',
  clientId: process.env.CLIENT_ID ? process.env.CLIENT_ID : '',
  clientSecret: process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '',
  fixApi: process.env.FIX_API_URL ? process.env.FIX_API_URL : '',
  axios: undefined
};

export const config = new Proxy(valueConfig, {
  get: (target, prop, _receiver) => {
    return target[prop];
  },
  set: (target, props, newVal, _receiver) => {
    target[props] = newVal;
    return true;
  }
});

export default config;
