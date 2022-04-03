const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");
const userService = require("./userService")


// 1. 로그인
exports.getNaverInfo = async function (access_token) {
  var token = access_token;
  var header = "Bearer " + token; // Bearer 다음에 공백 추가
  var api_url = 'https://openapi.naver.com/v1/nid/me';
  var request = require('request');
  var options = {
    url: api_url,
    headers: { 'Authorization': header }
  };
  return new Promise(function(resolve, reject){
    request.get(options, async function(error, response, body){
      if(error) reject(error);
      else {
        if (!error && response.statusCode == 200) {
          const bodyparse = JSON.parse(body);
          const name = bodyparse.response.name;
          const email = bodyparse.response.email;
          if (!email) {
            //validation 필요
            console.log('No email Info');
          } else if (!name) {
            //validation 필요
            console.log('No name Info');
          } else {
            const connection = await pool.getConnection(async (conn) => conn);
            let emailCheckResult = await userDao.getUserInfo(connection, email);

            //결과값 없으면 DB에 저장, 있으면 jwt
            if (emailCheckResult[0] == undefined) {
              const addUserResult = await userDao.insertUserInfo(connection, [name, name, email]);
              emailCheckResult = await userDao.getUserInfo(connection, email);
              const signupuserIdx = emailCheckResult[0]["userIdx"];
              const signupToken = await userService.signupToken(loginuserIdx);
              connection.release();
              resolve(signupToken);
            }
            else {
              const loginuserIdx = emailCheckResult[0]["userIdx"];
              const loginToken = await userService.loginToken(loginuserIdx);
              connection.release();
              resolve(loginToken);
            }
          }
        } else if (response.statusCode == 401) {
          resolve('error');
        } else {
          console.log('error');
          if (response != null) {
            console.log('error = ' + response.statusCode);
          }
          resolve(null);
        }
      }
    })
  });
}

// jwtMiddleware - 올바른 접근(로그인 상태) 체크
exports.checkValidAccess = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const checkValidAccessResult = await userDao.selectUserToken(connection, userIdx);
  connection.release();

  return checkValidAccessResult;
};

//0. userIdx 존재하는지 체크 validation
exports.userIdxCheck = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);

  const userIdxCheckResult = await userDao.selectUserIdx(connection, userIdx);

  connection.release();

  return userIdxCheckResult;
}

//4. 특정 유저의 닉네임 조회 API
exports.retrieveUserNickname = async function (userIdx){
  const connection = await pool.getConnection(async (conn) => conn);
  const userNicknameResult = await userDao.selectUserNickname(connection, userIdx);

  connection.release();
  return userNicknameResult;
}

//8. '00 님의 모험'
exports.retrieveUserNicknameAdventure = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userNicknameAdventureResult = await userDao.selectUserNicknameAdventure(connection, userIdx);

  connection.release();
  return userNicknameAdventureResult;
}
