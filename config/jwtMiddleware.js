const jwt = require('jsonwebtoken');
const secret_config = require('./secret');
const { response } = require("./response")
const { errResponse } = require("./response")
const baseResponse = require("./baseResponseStatus");

const userProvider = require("../src/app/User/userProvider");

const requestIp = require('request-ip');
const {logger} = require("./winston");

const jwtMiddleware = (req, res, next) => {
    // read the token from header or url
    const token = req.headers['x-access-token'] || req.query.token;
    // token does not exist
    if(!token) {
        return res.send(errResponse(baseResponse.TOKEN_EMPTY))
    }

    // create a promise that decodes the token
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, secret_config.jwtsecret , (err, verifiedToken) => {
                if(err){
                    logger.error(`App - client IP: ${requestIp.getClientIp(req)}, jwtMiddleware error\n: ${err.message}`);
                    reject(err);
                }
                resolve(verifiedToken)
            })
        }
    );

    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        return res.send(errResponse(baseResponse.TOKEN_VERIFICATION_FAILURE))
    };
    // process the promise
    p.then(async (verifiedToken) =>{
        //비밀 번호 바뀌었을 때 검증 부분 추가 할 곳

        // 루시 추가 - DB에서 jwt 토큰 유무 검사(로그인 시 생성, 로그아웃 시 제거)
        const loginCheckbyToken = await userProvider.checkValidAccess(verifiedToken.userIdx);
        //console.log("loginCheckbyToken: ", loginCheckbyToken)
        //로그아웃/회원탈퇴한 유저에 대해 접근하려는 경우
        if(loginCheckbyToken == null){
            logger.error(`App - client IP: ${requestIp.getClientIp(req)}, jwtMiddleware error - Wrong Access\n`);
            return res.send(errResponse(baseResponse.WRONG_ACCESS));
        }
        //현재 로그인되어있는 유저의 이전 로그인 jwt로 접근하려는 경우
        else if(loginCheckbyToken != token) {
            logger.error(`App - client IP: ${requestIp.getClientIp(req)}, jwtMiddleware error - Invalid Token\n`);
            return res.send(errResponse(baseResponse.INVALID_TOKEN));
        }
        else
            req.verifiedToken = verifiedToken;
            next();
    }).catch(onError)
};

module.exports = jwtMiddleware;