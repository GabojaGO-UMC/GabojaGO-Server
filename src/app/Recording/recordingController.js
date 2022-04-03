const jwtMiddleware = require("../../../config/jwtMiddleware");
const recordingProvider = require("../../app/Recording/recordingProvider");
const recordingService = require("../../app/Recording/recordingService");
const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const userProvider = require("../../app/User/userProvider");
const folderProvider = require("../../app/Folder/folderProvider");

const requestIp = require('request-ip');
const {logger} = require("../../../config/winston");

/**
 * API No. 0
 * API Name : 테스트 API
 * [GET] /app/test
 */
exports.getTest = async function (req, res) {
    return res.send(response(baseResponse.SUCCESS))
}

/**
 * API No. 9-1
 * API Name : 해당 날짜의 뽑기 개수 조회 API + JWT + Validation
 * [GET] /app/randomresultcount/:date
 */
 exports.getRandomResultCount = async function (req, res) {

    /**
     * Path Variable: date
     */

    const userIdx = req.verifiedToken.userIdx;
    const date = req.params.date;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getRandomResultCount API \n`);
    // errResponse 전달
    if (!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));
    if (!date) return res.send(errResponse(baseResponse.USER_DATE_EMPTY));

    // userIdx를 통한 randomresultList 검색 함수 호출 및 결과 저장
    const randomresultcount = await folderProvider.retrieveRandomResultCount(userIdx, date);
    if(randomresultcount.length<1) return res.send(errResponse(baseResponse.FOLDER_RANDOMRESULTCOUNT_ERROR));

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getRandomResultCount API \n`);
    return res.send(response(baseResponse.SUCCESS, randomresultcount));
};

/**
 * API No. 10
 * API Name : 해당 날짜의 뽑기기록_폴더 조회 API + JWT + Validation
 * [GET] /app/recordingList/folder/:date
 */
exports.getFolderList = async function (req, res) {

    /**
     * Path Variable: date
     */

    const userIdx = req.verifiedToken.userIdx;
    const date = req.params.date;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getFolderRecordList API \n`);

    // errResponse 전달
    if (!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));
    if (!date) return res.send(errResponse(baseResponse.USER_DATE_EMPTY));

    //해당 유저가 존재하는지 체크
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    // userIdx를 통한 randomresultList 검색 함수 호출 및 결과 저장
    let recordingList_folder = await recordingProvider.retrieveRecordingList_Folder(date, userIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getFolderRecordList API \n`);
    return res.send(response(baseResponse.SUCCESS,  {date, recordingList_folder}));
};


/**
 * API No. 10-1
 * API Name : 해당 날짜의 뽑기기록_개별 조회 API + JWT + Validation
 * [GET] /app/recordingList/each/:date
 */
exports.getEachList = async function (req, res) {

    /**
     * Path Variable: date
     */

    const userIdx = req.verifiedToken.userIdx;
    const date = req.params.date;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getEachRecordList API \n`);

    // errResponse 전달
    if (!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));
    if (!date) return res.send(errResponse(baseResponse.USER_DATE_EMPTY));

    //해당 유저가 존재하는지 체크
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    // userIdx를 통한 randomresultList 검색 함수 호출 및 결과 저장
    let recordingList_each = await recordingProvider.retrieveRecordingList_Each(date, userIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getEachRecordList API \n`);
    return res.send(response(baseResponse.SUCCESS,  {date, recordingList_each}));
};

/**
 * API No. 14-1
 * API Name : 폴더 기록하자 기록 API + JWT + Validation
 * [POST] /app/folderrecording/:folderIdx
 */
 exports.postFolderRecording = async function(req, res){

    /**
     * Path Variable: folderIdx
     * Body: recordingStar, recordingContent, recordingTitle, recordingImgUrl
     */

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing postFolderRecording API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    const {recordingStar, recordingContent, recordingTitle} = req.body;
    let recordingImgUrl = req.body.recordingImgUrl;

    //폴더 인덱스 존재 벨리데이션
    const folderIdx = req.params.folderIdx;
    if(!folderIdx) return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_EMPTY));

    //별점 빈 값 체크
    if(!recordingStar)
        return res.send(response(baseResponse.RECORDING_STAR_EMPTY));
    //별점 범위 체크
    if(recordingStar>5)
        return res.send(response(baseResponse.RECORDING_STAR_RANGE));
    //발자취 길이 체크
    if (recordingContent.length > 2000)
        return res.send(response(baseResponse.RECORDING_CONTENT_LENGTH));

    //제목 빈 값 체크
    if(!recordingTitle)
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    if(!recordingTitle.trim())
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    //제목 길이 체크
    if (recordingTitle.length > 15)
        return res.send(response(baseResponse.RECORDING_TITLE_LENGTH));
     //이미지 개수 체크
     if(recordingImgUrl!=null){
         if(recordingImgUrl.length >10)
             return res.send(response(baseResponse.RECORDING_IMG_LENGTH));
     }
    if(recordingImgUrl == null){
        //대신, 이거 service로 넘겨주긴 해야하므로 url이 없는 경우 빈 배열로 설정함
        recordingImgUrl = []
    }

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Folder(folderIdx, userIdx);
    const recordingCheck = await recordingProvider.recordingCheck_Folder(folderIdx); //레코딩에 있는지
    
    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));
    else if(recordingCheck) //항목 기록이 이미 존재하면 안됨
        return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_ALREADY_EXIST));
    //folderIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
    else if(userIdxSameCheck =='empty') //folderIdx가 현재 디비에 실제로 있는지 체크
        return res.send(errResponse(baseResponse.FOLDER_NOT_EXIST));
    else if(userIdxSameCheck == 'error') 
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));
    else{
        const addFolderRecordingResponse = await recordingService.insertFolderRecording(
            folderIdx, recordingStar, recordingContent.trim(), recordingTitle, recordingImgUrl
            );
    
        logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post postFolderRecording API \n`);
        return res.send(addFolderRecordingResponse);
    }
};


/**
 * API No. 14-2
 * API Name : 개별 기록하자 기록 API + JWT + Validation
 * [POST] /app/eachrecording/:randomResultIdx
 */
//개별 기록post api (별점, 사진, 일기)
//폴더인 경우 폴더 folderidx 갖고와서 작성, 개별인 경우 randomresultidx 갖고와서 작성
exports.postEachRecording = async function (req, res) {

    /**
     * Path Variable: randomResultIdx
     * Body: recordingStar, recordingContent, recordingTitle, recordingImgUrl
     */

    const userIdx = req.verifiedToken.userIdx
    const randomResultIdx = req.params.randomResultIdx;
    const {recordingStar, recordingContent, recordingTitle} = req.body;
    let recordingImgUrl = req.body.recordingImgUrl;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing postEachRecording API \n`);

    // 빈 값 체크
    if (!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));
    if (!randomResultIdx) return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_EMPTY));
    if (!recordingStar) return res.send(errResponse(baseResponse.RECORDING_STAR_EMPTY));
    if (recordingStar>5)
        return res.send(response(baseResponse.RECORDING_STAR_RANGE));

    //발자취 길이 체크
    if (recordingContent.length > 2000)
        return res.send(response(baseResponse.RECORDING_CONTENT_LENGTH));
    if (!recordingTitle) return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    if(!recordingTitle.trim())
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    //제목 길이 체크
    if (recordingTitle.length > 15)
        return res.send(response(baseResponse.RECORDING_TITLE_LENGTH));
    //이미지 개수 체크
    if(recordingImgUrl!=null){
        if(recordingImgUrl.length >10)
            return res.send(response(baseResponse.RECORDING_IMG_LENGTH));
    }
    if(recordingImgUrl == null){
        //대신, 이거 service로 넘겨주긴 해야하므로 url이 없는 경우 빈 배열로 설정함
        recordingImgUrl = []
    }

    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Each(randomResultIdx, userIdx);
    const recordingCheck = await recordingProvider.recordingCheck_Each(randomResultIdx); //레코딩에 있는지

    if(userIdxCheckRows.length < 1) //존재하지 않는 유저
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));
    else if(recordingCheck)
        return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_ALREADY_EXIST)); //항목 기록이 이미 존재하면 안됨  
    else if(userIdxSameCheck =='empty') //랜덤에 있는지 확인
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    else if(userIdxSameCheck == 'error') 
        return res.send(errResponse(baseResponse.RANDOMRESULT_WRONG_USERIDX));
    else{
        // insertEachRecording 함수 실행을 통한 결과 값을 addEachRecordingResponse에 저장
        const addEachRecordingResponse = await recordingService.insertEachRecording(
            randomResultIdx, recordingStar, recordingContent.trim(), recordingTitle, recordingImgUrl
            );
        logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post postEachRecording API \n`);
        // addEachRecordingResponse 값을 json으로 전달
        return res.send(addEachRecordingResponse);
    }
};

/**
 * API No. 15
 * API Name : 기록화면B 폴더 기록 조회 API
 * [GET] /app/recording/folder/:folderIdx
 */
exports.getFolderContent = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getFolderContent API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    //폴더 인덱스 존재 벨리데이션
    const folderIdx = req.params.folderIdx;
    if(!folderIdx) return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_EMPTY));

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //folderIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Folder(folderIdx, userIdx);
    if(userIdxSameCheck =='empty')
        return res.send(errResponse(baseResponse.FOLDER_NOT_EXIST));
    else if(userIdxSameCheck == 'error')
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));

    const recordingCheck = await recordingProvider.recordingCheck_Folder(folderIdx); //레코딩에 있는지
    if(!recordingCheck)
       return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_NOT_EXIST));

    //해당 폴더 기록을 갖고 옴
    const folderContentListResult = await recordingProvider.retrieveFolderContent(folderIdx);
    if(folderContentListResult.length <1){
        return res.send(errResponse(baseResponse.RECORDING_CONTENT_ERROR));
    }

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getFolderContent API \n`);
    return res.send(response(baseResponse.SUCCESS, folderContentListResult));
}

/**
 * API No. 15-1
 * API Name : 기록화면B 개별 기록 조회 API
 * [GET] /app/recording/eachContent/:randomResultIdx
 */
exports.getEachContent = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing getEachContent API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    //randomResultIdx가 존재하는지 체크 벨리데이션
    const randomResultIdx = req.params.randomResultIdx;
    if(!randomResultIdx) return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_EMPTY));

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //randomResultIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Each(randomResultIdx, userIdx);
    if(userIdxSameCheck =='empty')
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    if(userIdxSameCheck == 'error')
        return res.send(errResponse(baseResponse.RANDOMRESULT_WRONG_USERIDX));

    const recordingCheck = await recordingProvider.recordingCheck_Each(randomResultIdx); //레코딩에 있는지
    if(!recordingCheck)
        return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_NOT_EXIST));

    //해당 개별 기록을 갖고 옴
    const eachContentListResult = await recordingProvider.retrieveEachContent(randomResultIdx);
    if(eachContentListResult.length <1)
        return res.send(errResponse(baseResponse.RECORDING_CONTENT_ERROR));

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Get getEachContent API \n`);
    return res.send(response(baseResponse.SUCCESS, eachContentListResult));
}

/**
 * API No. 16
 * API Name : 기록화면B 폴더 기록 수정 API
 * [POST] /app/recording/folderCorrection/:folderIdx
 */
exports.patchFolderContent = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing patchFolderContent API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    /**
     * Body: recordingStar, recordingContent, recordingTitle, recordingImgUrl
     */
    const {recordingStar, recordingContent, recordingTitle} = req.body;
    let recordingImgUrl = req.body.recordingImgUrl;

    //폴더 인덱스 존재 벨리데이션
    const folderIdx = req.params.folderIdx;
    if(!folderIdx) return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_EMPTY));

    //별점 빈 값 체크
    if(!recordingStar)
        return res.send(response(baseResponse.RECORDING_STAR_EMPTY));
    //별점 범위 체크
    if(recordingStar>5)
        return res.send(response(baseResponse.RECORDING_STAR_RANGE));

    //발자취 길이 체크
    if (recordingContent.length > 2000)
        return res.send(response(baseResponse.RECORDING_CONTENT_LENGTH));

    //제목 빈 값 체크
    if(!recordingTitle)
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    if(!recordingTitle.trim())
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    //제목 길이 체크
    if (recordingTitle.length > 15)
        return res.send(response(baseResponse.RECORDING_TITLE_LENGTH));

    //이미지 개수 체크
    if(recordingImgUrl!=null){
        if(recordingImgUrl.length >10)
            return res.send(response(baseResponse.RECORDING_IMG_LENGTH));
    }

    //imgUrl은 null일 수 있으므로 벨리데이션은 따로 필요없음
    if(recordingImgUrl == null){
        //대신, 이거 service로 넘겨주긴 해야하므로 url이 없는 경우 빈 배열로 설정함
        recordingImgUrl = []
    }

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //folderIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Folder(folderIdx, userIdx);
    if(userIdxSameCheck =='empty') //folderIdx가 현재 디비에 실제로 있는지 체크해줘야 할 것 같음
        return res.send(errResponse(baseResponse.FOLDER_NOT_EXIST));
    else if(userIdxSameCheck == 'error')
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));

    //folderIdx가 Recording 테이블에 있는지 벨리데이션
    const recordingCheck = await recordingProvider.recordingCheck_Folder(folderIdx); //레코딩에 있는지
    if(!recordingCheck)
        return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_NOT_EXIST));

    const folderContentResponse = await recordingService.editFolderContent(
        folderIdx, recordingStar, recordingContent, recordingTitle, recordingImgUrl
    );

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post patchFolderContent API \n`);
    return res.send(folderContentResponse);
}

/**
 * API No. 16-1
 * API Name : 기록화면B 개별 기록 수정 API
 * [POST] /app/recording/eachCorrection/:randomResultIdx
 */
exports.patchEachContent = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing patchEachContent API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    /**
     * Body: recordingStar, recordingContent, recordingTitle, recordingImgUrl
     */

    const {recordingStar, recordingContent, recordingTitle} = req.body;
    let recordingImgUrl = req.body.recordingImgUrl;

    //randomResultIdx가 존재하는지 체크 벨리데이션
    const randomResultIdx = req.params.randomResultIdx;
    if(!randomResultIdx) return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_EMPTY));

    //별점 빈 값 체크
    if(!recordingStar)
        return res.send(response(baseResponse.RECORDING_STAR_EMPTY));
    //별점 범위 체크
    if(recordingStar>5)
        return res.send(response(baseResponse.RECORDING_STAR_RANGE));

    //발자취 길이 체크
    if (recordingContent.length > 2000)
        return res.send(response(baseResponse.RECORDING_CONTENT_LENGTH));

    //제목 빈 값 체크
    if(!recordingTitle)
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    if(!recordingTitle.trim())
        return res.send(response(baseResponse.RECORDING_TITLE_EMPTY));
    //제목 길이 체크
    if (recordingTitle.length > 15)
        return res.send(response(baseResponse.RECORDING_TITLE_LENGTH));

    //이미지 개수 체크
    if(recordingImgUrl!=null){
        if(recordingImgUrl.length >10)
            return res.send(response(baseResponse.RECORDING_IMG_LENGTH));
    }
    //imgUrl은 null일 수 있으므로 벨리데이션은 따로 필요없음
    if(recordingImgUrl == null){
        //대신, 이거 service로 넘겨주긴 해야하므로 url이 없는 경우 빈 배열로 설정함
        recordingImgUrl = []
    }

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //벨리데이션
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Each(randomResultIdx, userIdx);
    if(userIdxSameCheck == 'empty') //randomResultIdx가 현재 디비에 실제로 있는지 체크
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    if(userIdxSameCheck == 'error') //randomResultIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
        return res.send(errResponse(baseResponse.RANDOMRESULT_WRONG_USERIDX));

    //randomResultIdx가 Recording 테이블에 있는지 벨리데이션
    const recordingCheck = await recordingProvider.recordingCheck_Each(randomResultIdx); //레코딩에 있는지
    if(!recordingCheck)
        return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_NOT_EXIST));

    const eachContentResponse = await recordingService.editEachContent(
        randomResultIdx, recordingStar, recordingContent, recordingTitle, recordingImgUrl
    );

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post patchEachContent API \n`);
    return res.send(eachContentResponse);
}

/**
 * API No. 18-1
 * API Name : 기록화면B 폴더 기록 삭제 API
 * [POST] /app/recording/folderrecorddeletion/:folderIdx
 */
 exports.deleteFolderRecording = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing deleteFolderRecording API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    //폴더 인덱스 존재 벨리데이션
    const folderIdx = req.params.folderIdx;
    if(!folderIdx) return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_EMPTY));

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //folderIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Folder(folderIdx, userIdx);
    if(userIdxSameCheck =='empty') //folderIdx가 현재 디비에 실제로 있는지 체크
        return res.send(errResponse(baseResponse.FOLDER_NOT_EXIST));
    else if(userIdxSameCheck == 'error')
        return res.send(errResponse(baseResponse.FOLDER_WRONG_USERIDX));

    //folderIdx가 Recording 테이블에 있는지 벨리데이션
    const recordingCheck = await recordingProvider.recordingCheck_Folder(folderIdx); //레코딩에 있는지
    if(!recordingCheck)
        return res.send(errResponse(baseResponse.RECORDING_FOLDERIDX_NOT_EXIST));

    const deleteFolderRecordResponse = await recordingService.deleteFolderRecord(folderIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post deleteFolderRecording API \n`);
    return res.send(deleteFolderRecordResponse);
}

/**
 * API No. 18-2
 * API Name : 기록화면B 개별 기록 삭제 API
 * [POST] /app/recording/eachrecorddeletion/:randomResultIdx
 */
 exports.deleteEachRecording = async function(req, res){

    const userIdx = req.verifiedToken.userIdx;
    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Accessing deleteEachRecording API \n`);
    if(!userIdx) return res.send(errResponse(baseResponse.VERIFIEDTOKEN_USERIDX_EMPTY));

    //randomResultIdx가 존재하는지 체크 벨리데이션
    const randomResultIdx = req.params.randomResultIdx;
    if(!randomResultIdx) return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_EMPTY));

    //유저인덱스 존재 벨리데이션
    const userIdxCheckRows = await userProvider.userIdxCheck(userIdx);
    if(userIdxCheckRows.length < 1)
        return res.send(errResponse(baseResponse.USER_USERIDX_NOT_EXIST));

    //벨리데이션
    const userIdxSameCheck = await folderProvider.userIdxSameCheck_Each(randomResultIdx, userIdx);
    if(userIdxSameCheck == 'empty') //randomResultIdx가 현재 디비에 실제로 있는지 체크
        return res.send(errResponse(baseResponse.RANDOMRESULT_NOT_EXIST));
    if(userIdxSameCheck == 'error') //randomResultIdx 유저가 jwt 상의 userIdx가 맞는지 벨리데이션
        return res.send(errResponse(baseResponse.RANDOMRESULT_WRONG_USERIDX));

    //randomResultIdx가 Recording 테이블에 있는지 벨리데이션
    const recordingCheck = await recordingProvider.recordingCheck_Each(randomResultIdx); //레코딩에 있는지
    if(!recordingCheck)
        return res.send(errResponse(baseResponse.RECORDING_RANDOMRESULTIDX_NOT_EXIST));

    const deleteEachRecordResponse = await recordingService.deleteEachRecord(randomResultIdx);

    logger.info(`App - client IP: ${requestIp.getClientIp(req)}, userIdx: ${userIdx}, Post deleteEachRecording API \n`);
    return res.send(deleteEachRecordResponse);
}