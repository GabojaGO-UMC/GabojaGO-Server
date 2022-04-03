const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const randomResultProvider = require("./randomResultProvider");
const randomResultDao = require("./randomResultDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.createRandomResult = async function (userIdx, randomResultContent, randomResultType) {
    try {

        if(randomResultType != 1 && randomResultType != 2 && randomResultType != 3 && randomResultType != 4)
            return errResponse(baseResponse.RANDOMRESULT_TYPE_NOT_MATCH);

        const rangeValid = randomResultContent;
        const arr = rangeValid.split(",");
        for(let i=0; i<arr.length; i++){
            if(arr[i]>999999) return errResponse(baseResponse.RANDOMRESULT_RANGE);
        }

        const insertRandomResultParams = [userIdx, randomResultContent, randomResultType];

        const connection = await pool.getConnection(async (conn) => conn);

        const randomResultResult = await randomResultDao.insertRandomResult(connection, insertRandomResultParams);
        connection.release();

        return response(baseResponse.SUCCESS);

    } catch (err) {
        logger.error(`App - createRandomResult Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}

exports.eraseRandomResult = async function (userIdx, randomResultList, folderList) {

    const connection = await pool.getConnection(async (conn) => conn);
    try{
        //transaction
        await connection.beginTransaction();

        //개별 항목 삭제를 해야하는 경우
        if(randomResultList.length != 0){
            for(let i=0; i<randomResultList.length; i++){
                //1+. 개별 항목에 대한 recording이 있는 경우엔 recordingImg도 삭제해줘야함
                const deleteRecordingImg = await randomResultDao.deleteRecordingImg(connection, randomResultList[i]);
                //1.폴더에 속해있든 아니든 해당 개별 항목에 대한 recording이 있는 경우에만 삭제를 해줘야함
                const deleteRecording = await randomResultDao.deleteRecording(connection, randomResultList[i]);
                //2.그리고 그 randomResult 자체를 삭제해줌
                const deleteRandomResult = await randomResultDao.deleteRandomResult(connection, randomResultList[i]);
            }
        }

        //폴더 전체를 삭제해야 하는 경우
        if(folderList.length != 0){

            for(let i=0; i<folderList.length; i++){
                //1+.폴더 안에 개별에 엮여있던 recording의 img 삭제
                const deleteEachRecordingImgFolder = await randomResultDao.deleteEachRecordingImgFolder(connection, folderList[i]);
                //1.폴더에 안에 개별에 엮여있던 recording 삭제
                const deleteEachRecordingFolder = await randomResultDao.deleteEachRecordingFolder(connection, folderList[i]);
                //2.폴더 안에 randomResult 모두 삭제
                const deleteRandomResultFolder = await randomResultDao.deleteRandomResultFolder(connection, folderList[i]);
                //3+.폴더에 엮여있던 recording의 img 삭제
                const deleteRecordingImgFolder= await randomResultDao.deleteRecordingImgFolder(connection, folderList[i]);
                //3.폴더에 엮여있던 recording 삭제
                const deleteRecordingFolder = await randomResultDao.deleteRecordingFolder(connection, folderList[i]);
                //4.폴더 삭제
                const deleteFolder = await randomResultDao.deleteFolder(connection, folderList[i]);
            }
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);

    }catch(err){
        await connection.rollback();

        logger.error(`App - eraseRandomResult Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally{
        connection.release();
    }
}