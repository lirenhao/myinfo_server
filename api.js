const _ = require('lodash')
const querystring = require('querystring')
const fetch = require('node-fetch')
const URLSearchParams = require('url-search-params')
const myInfoConfig = require('config').get('L2')
const securityHelper = require('./security')

function getAuthoriseUrl(clientId, purpose) {
    const state = clientId
    return myInfoConfig.authApiUrl +
        "?client_id=" + myInfoConfig.clientId +
        "&attributes=" + myInfoConfig.attributes +
        "&purpose=" + purpose +
        "&state=" + state +
        "&redirect_uri=" + myInfoConfig.redirectUrl;
}

async function getTokenApi(code) {
    const cacheCtl = "no-cache";
    const contentType = "application/x-www-form-urlencoded";
    const method = "POST";

    // preparing the requegetAuthoriseUrlst with header and parameters
    // t2step3 PASTE CODE BELOW
    // assemble params for Token API
    const strParams = "grant_type=authorization_code" +
        "&code=" + code +
        "&redirect_uri=" + myInfoConfig.redirectUrl +
        "&client_id=" + myInfoConfig.clientId +
        "&client_secret=" + myInfoConfig.clientSecret;
    const params = querystring.parse(strParams);

    // assemble headers for Token API
    const strHeaders = "Content-Type=" + contentType + "&Cache-Control=" + cacheCtl;
    const headers = querystring.parse(strHeaders);

    // Sign request and add Authorization Headers
    // t3step2a PASTE CODE BELOW
    const authHeaders = securityHelper.generateAuthorizationHeader(
        myInfoConfig.tokenApiUrl,
        params,
        method,
        contentType,
        myInfoConfig.authLevel,
        myInfoConfig.clientId,
        myInfoConfig.privateKey,
        myInfoConfig.clientSecret,
        myInfoConfig.realmUrl
    );

    if (!_.isEmpty(authHeaders)) {
        _.set(headers, "Authorization", authHeaders);
    }
    // t3step2a END PASTE CODE

    console.log("Request Header for Token API:");
    console.log(JSON.stringify(headers));

    const formParams = new URLSearchParams()
    formParams.append('grant_type', 'authorization_code')
    formParams.append('code', code)
    formParams.append('redirect_uri', myInfoConfig.redirectUrl)
    formParams.append('client_id', myInfoConfig.clientId)
    formParams.append('client_secret', myInfoConfig.clientSecret)

    return fetch(myInfoConfig.tokenApiUrl, {
        headers,
        method: 'POST',
        body: formParams
    }).then(res => {
        if (res.status === 200) {
            return Promise.resolve(res.json())
        } else {
            return Promise.reject(res.text())
        }
    })
}

async function getPersonApi(accessToken) {
    const decoded = securityHelper.verifyJWS(accessToken, myInfoConfig.publicKey);
    if (decoded == undefined || decoded == null) {
        return Promise.reject({
            status: "ERROR",
            msg: "INVALID TOKEN"
        })
    }

    console.log("Decoded Access Token:");
    console.log(JSON.stringify(decoded));

    const uinfin = decoded.sub;
    if (uinfin == undefined || uinfin == null) {
        return Promise.reject({
            status: "ERROR",
            msg: "UINFIN NOT FOUND"
        });
    }
    const url = myInfoConfig.personApiUrl + "/" + uinfin + "/";
    const cacheCtl = "no-cache";
    Promise.reject
    const method = "GET";
    // assemble params for Person API
    // t2step6 PASTE CODE BELOW
    const strParams = "client_id=" + myInfoConfig.clientId +
        "&attributes=" + myInfoConfig.attributes;
    const params = querystring.parse(strParams);

    // assemble headers for Person API
    const strHeaders = "Cache-Control=" + cacheCtl;
    const headers = querystring.parse(strHeaders);

    // Sign request and add Authorization Headers
    // t3step2b PASTE CODE BELOW
    const authHeaders = securityHelper.generateAuthorizationHeader(
        url,
        params,
        method,
        "", // no content type needed for GET
        myInfoConfig.authLevel,
        myInfoConfig.clientId,
        myInfoConfig.privateKey,
        myInfoConfig.clientSecret,
        myInfoConfig.realmUrl
    );
    // t3step2b END PASTE CODE
    if (!_.isEmpty(authHeaders)) {
        _.set(headers, "Authorization", authHeaders + ",Bearer " + accessToken);
    } else {
        // NOTE: include access token in Authorization header as "Bearer " (with space behind)
        _.set(headers, "Authorization", "Bearer " + accessToken);
    }

    console.log("Request Header for Person API:");
    console.log(JSON.stringify(headers));
    console.log("Sending Person Request >>>");

    return fetch(url + '?' + strParams, {
            method: 'GET',
            headers
        })
        .then(res => res.text())
        .then(personData => {
            // TODO 错误码的返回
            if (personData == undefined || personData == null) {
                return Promise.reject({
                    status: "ERROR",
                    msg: "PERSON DATA NOT FOUND"
                })
            } else {
                if (myInfoConfig.authLevel === "L0") {
                    personData = JSON.parse(personData);
                    personData.uinfin = uinfin; // add the uinfin into the data to display on screen

                    console.log("Person Data :");
                    console.log(JSON.stringify(personData));
                    // successful. return data back to frontend
                    return personData;
                } else if (myInfoConfig.authLevel === "L2") {
                    console.log("Response from Person API:");
                    console.log(personData);
                    //t3step3 PASTE CODE BELOW
                    // header.encryptedKey.iv.ciphertext.tag
                    const jweParts = personData.split(".");

                    return securityHelper.decryptJWE(jweParts[0], jweParts[1], jweParts[2], jweParts[3], jweParts[4], myInfoConfig.privateKey)
                        .then(personData => {
                            if (personData == undefined || personData == null)
                                return Promise.reject({
                                    status: "ERROR",
                                    msg: "INVALID DATA OR SIGNATURE FOR PERSON DATA"
                                })
                            personData.uinfin = uinfin; // add the uinfin into the data to display on screen

                            console.log("Person Data (Decoded/Decrypted):");
                            console.log(JSON.stringify(personData));
                            // successful. return data back to frontend
                            return {
                                status: "SUCCESS",
                                msg: personData
                            }
                        })
                } else {
                    return Promise.reject({
                        status: "ERROR",
                        msg: "Unknown Auth Level"
                    })
                }
            }
        })
}

module.exports = {
    getAuthoriseUrl,
    getTokenApi,
    getPersonApi
}