const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const recordingProvider = require("./recordingProvider");
const recordingDao = require("./recordingDao");
const randomResultDao = require("../RandomResult/randomResultDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//14-1. 폴더 기록하자 기록 API
exports.insertFolderRecording = async function (folderIdx, recordingStar, recordingContent, recordingTitle, recordingImgUrl) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        //사진을 제외한 별점, 발자취, 제목은 따로 해줌
        const insertFolderRecordingParams = [folderIdx, recordingStar, recordingContent, recordingTitle];
        const folderRecordingResult = await recordingDao.insertFolderRecording(connection, insertFolderRecordingParams);

        //사진은 여기서 따로 처리함
        for(let i=0; i<recordingImgUrl.length; i++){
            let insertImgUrlParams = [folderIdx, recordingImgUrl[i]];
            await recordingDao.insertImgUrl(connection, insertImgUrlParams)
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();

        logger.error(`App - insertFolderRecording Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally{
        connection.release();
    }
};


//14-2. 개별 기록하자 기록 API
exports.insertEachRecording = async function (randomResultIdx, recordingStar, recordingContent, recordingTitle, recordingImgUrl) {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        await connection.beginTransaction();

        // 쿼리문에 사용할 변수 값을 배열 형태로 전달
        //사진을 제외한 별점, 발자취, 제목은 따로 해줌
        const insertEachRecordingParams = [randomResultIdx, recordingStar, recordingContent, recordingTitle];
        const eachRecordingResult = await recordingDao.insertEachRecording(connection, insertEachRecordingParams);

        //사진은 여기서 따로 처리함
        for(let i=0; i<recordingImgUrl.length; i++){
            let insertImgUrlParams = [randomResultIdx, recordingImgUrl[i]];
            await recordingDao.insertImgUrlEach(connection, insertImgUrlParams);
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();

        logger.error(`App - insertEachRecording Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally{
        connection.release();
    }
};

exports.editFolderContent = async function (folderIdx, recordingStar, recordingContent, recordingTitle, recordingImgUrl) {

    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        //사진을 제외한 별점, 발자취, 제목은 이 dao로 따로 해줌
        const editFolderParams = [recordingStar, recordingContent, recordingTitle, folderIdx];
        const editFolderContentResult = await recordingDao.updateFolderContent(connection, editFolderParams);

        //사진 수정해주기 전에 지금 저장되어 있던 사진 삭제
        await recordingDao.deleteImgUrl(connection, folderIdx);

        //사진은 여기서 따로 처리
        for(let i=0; i<recordingImgUrl.length; i++){
            let insertImgUrlParams = [folderIdx, recordingImgUrl[i]];
            await recordingDao.insertImgUrl(connection, insertImgUrlParams)
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch(err){
        await connection.rollback();

        logger.error(`App - editFolderContent Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally{
        connection.release();
    }
}

//16-1. 기록화면B 개별의 기록 수정 API
exports.editEachContent = async function (randomResultIdx, recordingStar, recordingContent, recordingTitle, recordingImgUrl) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {
        await connection.beginTransaction();

        //사진을 제외한 별점, 발자취, 제목은 이 dao로 따로 해줌
        const editEachParams = [recordingStar, recordingContent, recordingTitle, randomResultIdx];
        const editEachContentResult = await recordingDao.updateEachContent(connection, editEachParams);

        //사진 수정해주기 전에 지금 저장되어 있던 사진 삭제
        await recordingDao.deleteImgUrlEach(connection, randomResultIdx);

        //사진은 여기서 따로 처리
        for(let i=0; i<recordingImgUrl.length; i++){
            let insertImgUrlParams = [randomResultIdx, recordingImgUrl[i]];
            await recordingDao.insertImgUrlEach(connection, insertImgUrlParams);
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);
    } catch (err) {
        await connection.rollback();

        logger.error(`App - editEachContent Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally{
        connection.release();
    }
}

// 18-1. 폴더 기록 삭제
exports.deleteFolderRecord = async function (folderIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    try{
        //transaction
        await connection.beginTransaction();

        //폴더에 엮여있던 recording의 img 삭제
        const deleteRecordingImgFolder= await randomResultDao.deleteRecordingImgFolder(connection, folderIdx);
        //폴더에 엮여있던 recording 삭제
        const deleteRecordingFolder = await randomResultDao.deleteRecordingFolder(connection, folderIdx);

        await connection.commit();
        return response(baseResponse.SUCCESS);

    }catch(err){
        await connection.rollback();

        logger.error(`App - deleteFolderRecord Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally{
        connection.release();
    }
}

// 18-2. 개별 기록 삭제
exports.deleteEachRecord = async function (randomResultIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    try{
        //transaction
        await connection.beginTransaction();

        //개별 recording의 img 삭제
        const deleteRecordingImgEach= await randomResultDao.deleteRecordingImg(connection, randomResultIdx);
        //개별 recording 삭제
        const deleteRecordingEach = await randomResultDao.deleteRecording(connection, randomResultIdx);

        await connection.commit();
        return response(baseResponse.SUCCESS);

    }catch(err){
        await connection.rollback();

        logger.error(`App - deleteEachRecord Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally{
        connection.release();
    }
}