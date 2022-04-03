const jwtMiddleware = require("../../../config/jwtMiddleware");
const randomResultProvider = require("../../app/RandomResult/randomResultProvider");
const randomResultService = require("../../app/RandomResult/randomResultService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

//존재하는 유저인지 체크할 때 필요한 부분
const userProvider = require("../../app/User/userProvider");
const folderProvider = require("../../app/Folder/folderProvider");

const requestIp = require('request-ip');
const {logger} = require("../../../config/winston");


/*
*  API No.6
*  API Name : 뽑기기록 저장 API
* [POST] /app/randomResult
*/
exports.postRandomResult = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing postRandomResult API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    /**
     * Body: randomResultContent, randomResultType
     */
    const {randomResultContent, randomResultType} = req.body;

    //content 내용 빈값인지 체크
    if(!randomResultContent)
        return res.send(response(baseResponse.RANDOMRESULT_CONTENT_EMPTY));
    if(!randomResultContent.trim())
        return res.send(response(baseResponse.RANDOMRESULT_CONTENT_EMPTY));
    //content 길이 체크
    if(randomResultContent.length > 100)
        return res.send(response(baseResponse.RANDOMRESULT_CONTENT_LEGNTH));

    //type 내용 빈값인지 체크
    if(!randomResultType)
        return res.send(response(baseResponse.RANDOMRESULT_TYPE_EMPTY));

    const typeValid = randomResultContent;
    if(randomResultType == 4){
        const arr = typeValid.split(",");
        if(arr.length>10) return res.send(response(baseResponse.RANDOMRESULT_CONTENT_COUNT));
    }

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    const randomResultResponse = await randomResultService.createRandomResult(
        userIdx, randomResultContent, randomResultType
    );

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post postRandomResult API \n`);
    return res.send(randomResultResponse);
}

/*
*  API No.17
*  API Name : 뽑기기록 삭제 API
* [DELETE] /app/randomResult
*/
exports.deleteRandomResult = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing deleteRandomResult API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    /**
     * Body: randomResultList, folderList
     */
    let {randomResultList, folderList} = req.body;

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);

    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //body에 칼럼이 제대로 왔는지 체크하는 벨리데이션
    if(!randomResultList && !folderList) //두 칼럼 다 안 온 경우
        return res.send(response(baseResponse.RANDOMRESULT_DELETE_EMPTY));

    if(randomResultList && !folderList) { //두 칼럼 중 첫번째 칼럼만 작성한 경우
        //근데 그 첫번째 칼럼에 배열에 아무것도 없는 경우
        if(randomResultList.length<1) return res.send(errResponse(baseResponse.RANDOMRESULT_DELETE_EMPTY));
        //아닌 경우는 아래 코드 실행
        folderList = [];
    }
    else if(!randomResultList && folderList) { //두 칼럼 중 두번째 칼럼만 작성한 경우
        //근데 그 두번째 칼럼에 배열에 아무것도 없는 경우
        if(folderList.length<1) return res.send(errResponse(baseResponse.RANDOMRESULT_DELETE_EMPTY));
        //아닌 경우는 아래 코드 실행
        randomResultList = [];
    }
    else { //두 칼럼이 모두 있는 경우, 이 경우는 두 칼럼이 모두 빈 배열일 수 있음 (그럼 그냥 아무것도 삭제안됨)
        //둘 다 빈 배열인 경우
        if(randomResultList.length == 0 && folderList.length == 0)
            return res.send(response(baseResponse.RANDOMRESULT_DELETE_EMPTY));
    }

    for(let i=0; i<randomResultList.length; i++){
        //쿼리를 실행하기 전 randomResultIdx의 userIdx와 jwt의 userIdx 값이 일치하는지 확인 validation
        const userIdxSameCheck = await folderProvider.userIdxSameCheck_Each(randomResultList[i], userIdx);
        if(userIdxSameCheck == 'empty') //실제로 randomResultList[i]인 개별항목이 디비에 실제로 있는지 체크
            return res.send(response(baseResponse.RANDOMRESULT_NOT_EXIST));
        if(userIdxSameCheck == 'error') //실제로 randomResultList[i]의 userIdx가 userIdx와 같은 값인지 체크
            return res.send(response(baseResponse.RANDOMRESULT_WRONG_USERIDX));
    }
    for(let i=0; i<folderList.length; i++){
        //쿼리를 실행하기 전 randomResultIdx의 userIdx와 jwt의 userIdx 값이 일치하는지 확인 validation
        const userIdxSameCheck = await folderProvider.userIdxSameCheck_Folder(folderList[i], userIdx);
        if(userIdxSameCheck == 'empty') //실제로 folderList[i]인 폴더가 디비에 실제로 있는지 체크
            return res.send(response(baseResponse.FOLDER_NOT_EXIST));
        if(userIdxSameCheck == 'error')
            return res.send(response(baseResponse.FOLDER_WRONG_USERIDX));
    }

    const randomDeleteRandomResult = await randomResultService.eraseRandomResult(
        userIdx, randomResultList, folderList
    );

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Delete deleteRandomResult API \n`);
    return res.send(randomDeleteRandomResult);
}