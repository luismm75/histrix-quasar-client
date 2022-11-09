let valueConfig = {
 db: process.env.DB ? process.env.DB : '' ,
 baseUrl: process.env.BASE_URL ? process.env.BASE_URL : '',
 mainUrl: process.env.MAIN_URL ?  process.env.MAIN_URL : '',
 apiUrl: process.env.API_URL ?  process.env.API_URL : '',
 clientId: process.env.CLIENT_ID ? process.env.CLIENT_ID : '',
 clientSecret: process.env.CLIENT_SECRET ? process.env.CLIENT_SECRET : '',


}

export const config = new Proxy(valueConfig, {
    get: (target, prop, receiver)=>{
        return target[prop]
    },
    set: (target, props, newVal, receiver)=>{
        if (typeof newVal !== 'string') return
        target[props] = newVal;
    }
})

export default config;