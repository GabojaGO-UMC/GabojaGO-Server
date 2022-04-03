const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const baseResponse = require("../../../config/baseResponseStatus");
const {response, errResponse} = require("../../../config/response");

const recordingDao = require("./recordingDao");


//10. 해당 날짜의 Folder LIST 조회
exports.retrieveRecordingList_Folder = async function (date, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const folderList = await recordingDao.selectFolderIdx(connection, [date, userIdx]);

    const recordingFolderFinal = [];

    for (var i = 0; i < folderList.length; i++) {

        let folderIdx = folderList[i].folderIdx;
        let folderListResult = await recordingDao.selectRecordingPage_folder(connection, folderIdx);
        let hasRecordingCheck = await recordingDao.selectRecordingIdx_folder(connection, folderIdx);

        let hasRecording;
        let folderTitle;

        if(!hasRecordingCheck){
            hasRecording = false;
            folderTitle = null;
        }
        else{
            hasRecording = true;
            folderTitle = hasRecordingCheck.recordingTitle;
        }

        recordingFolderFinal.push({folderIdx, hasRecording, folderTitle, folderListResult});
    }
    connection.release();
    return recordingFolderFinal;
}


//10-1. 해당 날짜의 RandomResult List 조회
exports.retrieveRecordingList_Each = async function (date, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const randomResultList = await recordingDao.selectRandomResultIdx(connection, [date, userIdx]);

    let randomResultListResult;
    let hasRecording;
    const recordingEachFinal = [];
    for (var i = 0; i < randomResultList.length; i++) {
        randomResultListResult = await recordingDao.selectRecordingPage_each(connection, randomResultList[i].randomResultIdx);

        hasRecording = await recordingDao.selectRecordingIdx_each(connection, randomResultList[i].randomResultIdx);
        if (!hasRecording)
            hasRecording = false;
        else
            hasRecording = true;

        recordingEachFinal.push({hasRecording, randomResultListResult});
    }
    connection.release();
    return recordingEachFinal;
}

//15.기록화면B 폴더의 기록 조회 API
exports.retrieveFolderContent = async function(folderIdx){

    const connection = await pool.getConnection(async (conn) => conn);

    let contentCheck = true; //발자취 내용 있으면 true 없으면 false
    let folderContentResult = await recordingDao.selectFolderContent(connection, folderIdx);
    let imgListCheck = true; //이미지 있으면 true 없으면 false
    let folderImgListResult = await recordingDao.selectFolderImgList(connection, folderIdx);
    const folderRandomResult = await recordingDao.selectFolderRandomResult(connection, folderIdx);

    if(!folderContentResult.recordingContent){
        contentCheck = false;
        folderContentResult.recordingContent = "";
    }
    if (folderImgListResult.length < 1) {
        imgListCheck = false;
    } //사진 0개이면 그냥 빈 배열 넘겨주면 됨
    if(!folderRandomResult) return errResponse(baseResponse.FOLDER_RANDOMRESULT_EMPTY);

    connection.release();

    return {contentCheck,folderContentResult,imgListCheck,folderImgListResult,folderRandomResult};
}

//15-1. 기록화면B 개별의 기록 조회 API
exports.retrieveEachContent = async function(randomResultIdx){
    const connection = await pool.getConnection(async (conn) => conn);

    let contentCheck = true; //발자취 내용 있으면 true 없으면 false
    let eachContentResult = await recordingDao.selectEachContent(connection, randomResultIdx);
    let imgListCheck = true; //이미지 있으면 true 없으면 false
    let eachImgListResult = await recordingDao.selectEachImgList(connection, randomResultIdx);
    const eachRandomResult = await recordingDao.selectEachRandomResult(connection, randomResultIdx);

    if(!eachContentResult.recordingContent) {
        contentCheck = false;
        eachContentResult.recordingContent = "";
    }
    if(eachImgListResult.length < 1) {
        imgListCheck = false;
    }
    if(!eachRandomResult) return errResponse(baseResponse.EACH_RANDOMRESULT_EMPTY);

    connection.release();

    return {contentCheck, eachContentResult, imgListCheck, eachImgListResult, eachRandomResult};
}

//folderIdx가 Recording 테이블에 있는지 벨리데이션
exports.recordingCheck_Folder = async function(folderIdx){
    const connection = await pool.getConnection(async (conn) => conn);

    const recordingExistResult = await recordingDao.selectFolderExist(connection, folderIdx);

    connection.release();
    return recordingExistResult;
}


//randomResultIdx가 Recording 테이블에 있는지 벨리데이션
exports.recordingCheck_Each = async function(randomResultIdx){
    const connection = await pool.getConnection(async (conn) => conn);

    let recordingExistResult = await recordingDao.selectEachExist(connection, randomResultIdx);

    connection.release();
    return recordingExistResult;
}