const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const folderProvider = require("./folderProvider");
const folderDao = require("./folderDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//11. 폴더 생성
exports.createFolder = async function (userIdx, randomResultIdx) {

    const connection = await pool.getConnection(async (conn) => conn);
    try{

        //transaction _ 폴더 생성 동시에 randomResult 테이블의 folderIdx 컬럼값 변경
        await connection.beginTransaction();

        const createFolderResult = await folderDao.insertFolder(connection, userIdx);
        const folderIdx = createFolderResult[0].insertId;

        //randomResultIdx length만큼 반복문 돌리고 원소 하나씩 넘겨줌. 배열로 받으니까.
        for(var i = 0; i<randomResultIdx.length; i++){
            const editRandomResultFolderIdxResult = await folderDao.updateRandomResultFolderIdx(connection, folderIdx, randomResultIdx[i]);
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);

    }catch(err){
        await connection.rollback();

        logger.error(`App - createFolder Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally{
        connection.release();
    }
}

//12. 폴더 수정
exports.editFolder = async function (folderIdx, plus_randomResultIdx, minus_randomResultIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try{

        await connection.beginTransaction();

        for(var i = 0; i< plus_randomResultIdx.length; i++) {
            const edit_plusFolderResult = await folderDao.update_plusFolder(connection, folderIdx, plus_randomResultIdx[i]);
        }

        for(var i = 0; i < minus_randomResultIdx.length; i++) {
            const edit_minusFolderResult = await folderDao.update_minusFolder(connection, minus_randomResultIdx[i]);
        }

        await connection.commit();
        return response(baseResponse.SUCCESS);
    }catch(err){
        await connection.rollback();

        logger.error(`App - editFolder Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }finally {
        connection.release();
    }
}


//13. 폴더 해체
exports.eraseFolder = async function(folderIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    try {

        //transaction _ 폴더 삭제 동시에 randomResult 테이블의 folderIdx 컬럼값 변경, recording 테이블의 기록 삭제
        await connection.beginTransaction();

        const deleteFolderResult = await folderDao.deleteFolderTuple(connection, folderIdx);

        const editRandomResultFolderIdx = await folderDao.update_deleteRandomResultFolderIdx(connection, folderIdx);

        const deleteFolderRecording = await folderDao.deleteFolderRecordingTuple(connection, folderIdx);

        await connection.commit();
        return response(baseResponse.SUCCESS);

    } catch (err) {
        await connection.rollback();

        logger.error(`App - eraseFolder Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    } finally {
        connection.release();
    }
}