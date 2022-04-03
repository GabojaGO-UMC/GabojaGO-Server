const {logger} = require("../../../config/winston");
const {pool} = require("../../../config/database");
const secret_config = require("../../../config/secret");

const userProvider = require("./userProvider");
const userDao = require("./userDao");

const baseResponse = require("../../../config/baseResponseStatus");
const {response} = require("../../../config/response");
const {errResponse} = require("../../../config/response");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// 1-1. 회원가입
exports.signupToken = async function (signupuserIdx) {
    try {
        //토큰 생성 Service - try~catch 작성
        let token = await jwt.sign(
            {
              userIdx: signupuserIdx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
              expiresIn: "365d",
              subject: "User",
            } // 유효 기간 365일
          );
        console.log({ 'userIdx': signupuserIdx, 'jwt': token });
        //로그인 시 발급되는 jwt를 DB에 저장
        const connection = await pool.getConnection(async (conn) => conn);
        const userToken = await userDao.updateUserToken(connection, [token, signupuserIdx]);
        connection.release();
        return response(baseResponse.SIGNUP_SUCCESS, {"jwt" :token});

    } catch (err) {
        logger.error(`App - signupToken Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 1-2. 로그인
exports.loginToken = async function (loginuserIdx) {
    try {
        //토큰 생성 Service - try~catch 작성
        let token = await jwt.sign(
            {
              userIdx: loginuserIdx,
            }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀키
            {
              expiresIn: "365d",
              subject: "User",
            } // 유효 기간 365일
          );
        console.log({ 'userIdx': loginuserIdx, 'jwt': token });
          //로그인 시 발급되는 jwt를 DB에 저장
        const connection = await pool.getConnection(async (conn) => conn);
        const userToken = await userDao.updateUserToken(connection, [token, loginuserIdx]);
        connection.release();
        return response(baseResponse.NAVER_LOGIN_SUCCESS, {"jwt" :token});

    } catch (err) {
        logger.error(`App - loginToken Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
};

// 2. 로그아웃 API
exports.logoutUser = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        //transaction
        await connection.beginTransaction();

        // Token 삭제 - User 테이블의 token 값을 null로 초기화해줌
        await userDao.eraseUserToken(connection, userIdx);

        await connection.commit();
        return response(baseResponse.SUCCESS);
    }
    catch(err){
        await connection.rollback();
        logger.error(`App - logoutUser Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally{
        connection.release();
    }
}

//3. 회원탈퇴 API
exports.eraseUserInfo = async function(userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    try{
        //transaction
        await connection.beginTransaction();

        //이메일삭제
        //유저정보 중에서 이메일 값만 null로 초기화해줌
        await userDao.updateUserEmail(connection, userIdx);

        //[폴더]
        //폴더 관련 기록 이미지 삭제
        await userDao.deleteFolderRecordingImg(connection, userIdx);
        //폴더 관련 기록 삭제
        await userDao.deleteFolderRecording(connection, userIdx);
        //폴더 삭제
        await userDao.deleteFolder(connection, userIdx);

        //[개별]
        //개별 관련 기록 이미지 삭제
        await userDao.deleteRandomResultRecordingImg(connection, userIdx);
        //개별 관련 기록 삭제
        await userDao.deleteRandomResultRecording(connection, userIdx);
        //개별 삭제
        await userDao.deleteRandomResult(connection, userIdx);

        // Token 삭제 - User 테이블의 token 값을 null로 초기화해줌
        await userDao.eraseUserToken(connection, userIdx);

        await connection.commit();
        return response(baseResponse.SUCCESS);
    }
    catch(err){
        await connection.rollback();
        logger.error(`App - eraseUserInfo Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
    finally{
        connection.release();
    }
}

//5. 특정 유저의 닉네임 수정 API + JWT + validation
exports.editUserNickname = async function(userIdx, userNickname) {
    try{
        const connection = await pool.getConnection(async (conn) => conn);

        const editUserNicknameByUserIdx = await userDao.updateUserNickname(connection, userNickname, userIdx);

        connection. release();

        return response(baseResponse.SUCCESS, editUserNicknameByUserIdx);

    }catch (err){
        logger.error(`App - editUserNickname Service error\n: ${err.message}`);
        return errResponse(baseResponse.DB_ERROR);
    }
}
