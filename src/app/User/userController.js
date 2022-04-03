const jwtMiddleware = require("../../../config/jwtMiddleware");
const userProvider = require("../../app/User/userProvider");
const userService = require("../../app/User/userService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const requestIp = require('request-ip');
const {logger} = require("../../../config/winston");

/** 
 * API No. 1
 * API Name : 로그인 API (JWT 생성) 
 * [Post] /auth/naver
 */
exports.getNaverJWT = async function(req, res) {
    /**
     * Body: access_token
     */
    const access_token = req.body.access_token;
    if(!access_token)
        return res.send(errResponse(baseResponse.ACCESS_TOKEN_EMPTY))
    const userCheckbyToken = await userProvider.getNaverInfo(access_token);
    if(userCheckbyToken == null)
        return res.send(errResponse(baseResponse.NAVER_LOGIN_ERROR))
    else if(userCheckbyToken == 'error')
        return res.send(errResponse(baseResponse.ACCESS_TOKEN_NOT_VALID))
    else
        logger.info(`App - client IP: ${requestIp.getClientIp(req)}, Get Naverlogin API \n`);
        return res.send(userCheckbyToken);
}

/**
 * API NO. 1-1
 * API Name : 자동 로그인 API
 * [GET] app/user/autologin
 */
exports.getautoLogin = async function(req, res){
    const userIdx = req.verifiedToken.userIdx;
    let isLogined;

    if(userIdx)
        isLogined = true;
    else
        isLogined = false;

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get autoLogin API \n`);
    return res.send(response(baseResponse.SUCCESS, isLogined));
}

/**
 * API NO. 2
 * API Name : 로그아웃 API
 * [GET] /app/user/logout
 */
 exports.logoutUser = async function (req, res){
    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing logout API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    const logoutUserRow = await userService.logoutUser(userIdx);
    
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get logout API \n`);
    return res.send(response(baseResponse.LOGOUT_SUCCESS));
};

/**
 * API NO. 3
 * API Name : 회원탈퇴 API
 * [POST] /app/withdrawal
 */
exports.deleteUserInfo = async function (req, res){
    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing withdrawal API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    const userInfoRows = await userService.eraseUserInfo(userIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post withdrawal API \n`);
    return res.send(response(baseResponse.SUCCESS));
};

/**
 * API NO. 4
 * API Name :특정 유저의 닉네임 조회 API + JWT + Validation
 * [GET] /app/user/nickname
 */

exports.getNickname = async function (req, res){
    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getNickname API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    const nicknameByUserIdxResult = await userProvider.retrieveUserNickname(userIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getNickname API \n`);
    return res.send(response(baseResponse.SUCCESS, nicknameByUserIdxResult));
};


/**
 * API No 5.
 * API Name: 특정 유저의 닉네임 수정 API + JWT + validation
 * [PATCH] /app/users/nickname
 */

/**
 body: userNickname
 */
exports.patchNickname = async function (req, res){
    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing patchNickname API \n`);

    const userNickname = req.body.userNickname;

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    //errResponse
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));
    else if(!userNickname) //userNickname 값 안 줌
        return res.send(errResponse(baseResponse.USER_NICKNAME_EDIT_EMPTY));
    else if(userNickname.length > 25) //userNickname 값의 길이 체크
        return res.send(errResponse(baseResponse.USER_NICKNAME_TOOLONG));
    else{
        const editUserNicknameByUserIdxResult = await userService.editUserNickname(userIdx, userNickname);

        logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Patch patchNickname API \n`);
        return res.send(response(baseResponse.SUCCESS));
    }
};

/**
 * API No 8.
 * API Name: '케융 님의 모험' _ 캘린더
 * [GET] /nicknameAdventure/:userIdx
 */

exports.getNicknameAdventure = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getNicknameAdventure API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    const nicknameAdventureResult = await userProvider.retrieveUserNicknameAdventure(userIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getNicknameAdventure API \n`);
    return res.send(response(baseResponse.SUCCESS, nicknameAdventureResult));
}
