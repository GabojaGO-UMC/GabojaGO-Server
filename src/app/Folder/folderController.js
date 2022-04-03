const jwtMiddleware = require("../../../config/jwtMiddleware");
const folderProvider = require("../../app/Folder/folderProvider");
const folderService = require("../../app/Folder/folderService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");
const userProvider = require("../../app/User/userProvider");

const requestIp = require('request-ip');
const {logger} = require("../../../config/winston");

/**
 * API No. 7
 * API Name : 캘린더 조회 API + JWT + Validation 
 * [GET] /app/calendar/:yearmonth
 */
 exports.getRandomResultDateList = async function (req, res) {

    /**
     * Path Variable: yearmonth
     */

    const userIdx = req.verifiedToken.userIdx;
    const yearmonth = req.params.yearmonth;
    const ip = req.headers['x-forwarded-for'] ||  req.connection.remoteAddress;

    logger.info(`App - client IP: ${ip}, userIdx: ${userIdx}, Accessing calendar API \n`);

    // errResponse 전달
    if (!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));
    if (!yearmonth) return res.send(errResponse(baseResponse.USER_YEARMONTH_EMPTY));

    // userIdx를 통한 randomresultdateList 검색 함수 호출 및 결과 저장
    const userjoindate = await folderProvider.retrieveUserJoinDate(userIdx);
    const monthlyAdventureTimes = await folderProvider.retrieveMonthlyAdventureTimes(userIdx, yearmonth);
    const randomresultdateList = await folderProvider.retrieveRandomResultDateList(userIdx, yearmonth);

    if(!userjoindate) return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST))
    if(monthlyAdventureTimes.length<1) return res.send(errResponse(baseResponse.FOLDER_MONTHLYADVENTURETIME_ERROR))
    if(!randomresultdateList) return res.send(errResponse(baseResponse.FOLDER_RANDOMRESULTDATELIST_NOT_EXIST))
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get calendar API \n`);
    return res.send(response(baseResponse.SUCCESS, {userjoindate, monthlyAdventureTimes, randomresultdateList}));
};


/**
 * API No. 11
 * API Name : 폴더 생성 api + JWT + validation
 * [POST] /app/folder/new
 * Body: randomResultIdx
 */
exports.postFolder = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const randomResultIdxList = req.body.randomResultIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing createFolder API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY))

    //userIdx 존재하는지 체크
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //randomResultIdx 값 줬는지 체크
    if(!randomResultIdxList)
        return res.send(errResponse(baseResponse.FOLDER_RANDOMRESULTIDX_EMPTY));

    if(randomResultIdxList.length <2)
        return res.send(errResponse(baseResponse.FOLDER_CANNOT_CREATE))

    //넘겨받은 userIdx와 randomResultIdx의 userIdx가 일치하는지 체크
    const userIdxSameCheck = await folderProvider.userIdxSameCheck(randomResultIdxList, userIdx);
    if(userIdxSameCheck =='empty') //존재하지 않는 randomResultIdx
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    else if(userIdxSameCheck == 'error') //불일치
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));

    //folderIdx가 Null인지 체크
    const folderIdxNullCheck = await folderProvider.randomResultFolderIdxCheck(randomResultIdxList);
    if(folderIdxNullCheck == 'error') //해당 randomResultIdx의 folderIdx가 null인지 확인
        return res.send(errResponse(baseResponse.FOLDER_FOLDERIDX_NOTNULL));

    const createFolder = await folderService.createFolder(userIdx, randomResultIdxList);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post createFolder API \n`);
    return res.send(response(baseResponse.SUCCESS));
};


/**
 * API No. 12
 * API Name : 폴더 수정 api + JWT + validation
 * [PATCH] /folder/update
 * Body: folderIdx, plus_randomResultIdx, minus_randomResultIdx
 */
exports.patchFolder = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    let {folderIdx, plus_randomResultIdx, minus_randomResultIdx} = req.body;

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing patchFolder API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY))
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    if(!folderIdx)
        return res.send(errResponse(baseResponse.FOLDER_FOLDERIDX_EMPTY));

    //body에 칼럼이 제대로 왔는지 체크
    if(!plus_randomResultIdx && !minus_randomResultIdx)
        return res.send(errResponse(baseResponse.FOLDER_EDIT_EMPTY));
    else if(plus_randomResultIdx && !minus_randomResultIdx){
        if(plus_randomResultIdx.length<1)
            return res.send(errResponse(baseResponse.FOLDER_EDIT_EMPTY));
        minus_randomResultIdx = [];
    }else if(!plus_randomResultIdx && minus_randomResultIdx){
        if(minus_randomResultIdx.length<1)
            return res.send(errResponse(baseResponse.FOLDER_EDIT_EMPTY));
        plus_randomResultIdx = [];
    }else{
        if(plus_randomResultIdx.length == 0 && minus_randomResultIdx.length == 0)
            return res.send(errResponse(baseResponse.FOLDER_EDIT_EMPTY));
    }

    if(plus_randomResultIdx.length == undefined || minus_randomResultIdx.length == undefined)
        return res.send(errResponse(baseResponse.SHOULD_BE_ARRAY))

    const countInFolder = await folderProvider.retrieveCountInFolder(folderIdx);
    if(countInFolder.length + plus_randomResultIdx.length - minus_randomResultIdx.length <= 1)
        return res.send(errResponse(baseResponse.FOLDER_SHOULD_HAVE));

    const compareWithFolder = await folderProvider.retrieveRandomResultIdxInFolder(folderIdx, plus_randomResultIdx, minus_randomResultIdx);
    if(compareWithFolder[0] == 0 || compareWithFolder[1] == 0)
        return res.send(errResponse(baseResponse.FOLDER_EDIT_WRONG_CHOICE));

    //넘겨받은 userIdx와 folderIdx의 userIdx가 일치하는지 체크
    const userIdxSameCheck_folder = await folderProvider.userIdxSameCheck_Folder(folderIdx, userIdx);
    if(userIdxSameCheck_folder =='empty') //존재 x
        return res.send(errResponse(baseResponse.FOLDER_NOT_EXIST));
    else if(userIdxSameCheck_folder == 'error')
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));

    //넘겨받은 userIdx와 randomResultIdx의 userIdx가 일치하는지 체크 _ plus
    const userIdxSameCheck_plus = await folderProvider.userIdxSameCheck(plus_randomResultIdx, userIdx);
    if(userIdxSameCheck_plus =='empty') //존재 x
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    else if(userIdxSameCheck_plus == 'error') //불일치
        return res.send(errResponse(baseResponse.RANDOMRESULT_WRONG_USERIDX));

    //넘겨받은 userIdx와 randomResultIdx의 userIdx가 일치하는지 체크 _ minus
    const userIdxSameCheck_minus = await folderProvider.userIdxSameCheck(minus_randomResultIdx, userIdx);
    if(userIdxSameCheck_minus =='empty') //존재 x
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    else if(userIdxSameCheck_minus == 'error') //불일치
        return res.send(errResponse(baseResponse.RANDOMRESULT_WRONG_USERIDX));

    const patchFolder = await folderService.editFolder(folderIdx, plus_randomResultIdx, minus_randomResultIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Patch patchFolder API \n`);
    return res.send(response(baseResponse.SUCCESS));
}

/**
 * API No. 13
 * API Name : 폴더 해체 api
 * [DELETE] /app/folder/delete
 */
exports.deleteFolder = async function (req, res) {
    const userIdx = req.verifiedToken.userIdx;
    const folderIdx = req.params.folderIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing deleteFolder API \n`);

    if(!userIdx)
        return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    if(!folderIdx)
        return res.send(errResponse(baseResponse.FOLDER_FOLDERIDX_EMPTY));

    //userIdx 존재하는지 체크
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //넘겨받은 userIdx와 folderIdx의 userIdx가 일치하는지 체크
    const userIdxSameCheck_folder = await folderProvider.userIdxSameCheck_Folder(folderIdx, userIdx);
    if(userIdxSameCheck_folder =='empty')
        return res.send(errResponse(baseResponse.FOLDER_NOT_EXIST));
    else if(userIdxSameCheck_folder == 'error')
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));

    const deleteFolder = await folderService.eraseFolder(folderIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Delete deleteFolder API \n`);
    return res.send(response(baseResponse.SUCCESS));
}
