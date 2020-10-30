export default {
    request: function (req, token) {
        this.http.setHeaders.call(this, req, {
            Authorization: 'Bearer ' + token
        });
    },

    response: function (res) {
        /**
         * TODO: Further investigation about the tokens must be implemented
         * Laravel responses expires_in in seconds. Because it is useless
         * unless you keep the timestamp of tokens response, we convert it into
         * expire date by converting to miliseconds first then adding to now timestamp
         */

        let accessToken = res.data.access_token,
            refreshToken = res.data.refresh_token,
            tokenExpireDate = res.data.expires_in + ( res.data.expires_in * 1000 ) + Date.now();

	    return accessToken;
        /**
         * TODO: Again, do more checks for the tokens!
         */
        /*
        if (accessToken) {
            return {
                accessToken, refreshToken, tokenExpireDate
            };
        }
        */
    }

    /*
    response: function (res) {
        var headers = this.http.getHeaders.call(this, res),
            token   = headers.Authorization || headers.authorization;

        if (token) {
            token = token.split(/Bearer:?\s?/i);

            return token[token.length > 1 ? 1 : 0].trim();
        }
    }
    */
};





