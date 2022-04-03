const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const folderDao = require("./folderDao");

// 7, 9, 10. 유저가 가입한 달 제공
exports.retrieveUserJoinDate = async function (userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const UserJoinDate = await folderDao.selectUserJoinDate(connection, userIdx);

  connection.release();
  return UserJoinDate;
};

// 7. 해당 년월의 유저 뽑기기록 날짜들 조회
exports.retrieveRandomResultDateList = async function (userIdx, yearmonth) {
    const connection = await pool.getConnection(async (conn) => conn);
    const RandomResultDateList = await folderDao.selectRandomResultDateList(connection, [userIdx, yearmonth]);
  
    connection.release();
    return RandomResultDateList;
  };

// 9. 해당 월의 유저 총 모험 횟수 조회
exports.retrieveMonthlyAdventureTimes = async function (userIdx, yearmonth) {
    const connection = await pool.getConnection(async (conn) => conn);
    let monthlyAdventureTimes = await folderDao.selectMonthlyAdventureTimes(connection, [userIdx, yearmonth]);
  
    connection.release();
    monthlyAdventureTimes = String(monthlyAdventureTimes);
    return monthlyAdventureTimes;
  };
  
// 10. 해당 날짜의 뽑기기록 조회
exports.retrieveRandomResultList = async function (userIdx, date) {
    const connection = await pool.getConnection(async (conn) => conn);
    const RandomResultList = await folderDao.selectRandomResultList(connection, [userIdx, date]);

    connection.release();
    return RandomResultList;
};

// 10. 해당 날짜의 뽑기 개수 조회
exports.retrieveRandomResultCount = async function (userIdx, date) {
    const connection = await pool.getConnection(async (conn) => conn);
    const RandomResultCount = await folderDao.selectRandomResultCount(connection, [userIdx, date]);
  
    connection.release();
    return RandomResultCount;
  };

//11 validation_ 해당 randomResutIdx의 folderIdx 값이 null인지 확인
exports.randomResultFolderIdxCheck = async function (randomResultIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    let randomResultFolderIdxCheckResult;
    for (var i = 0; i < randomResultIdx.length; i++) {
        randomResultFolderIdxCheckResult = await folderDao.selectRandomResultFolderIdx(connection, randomResultIdx[i]);
        if(randomResultFolderIdxCheckResult[0].folderIdx != null) {
            randomResultFolderIdxCheckResult = 'error';
            break;
        }
    }
    connection.release();
    return randomResultFolderIdxCheckResult;
}

//11,14 validation_ randomResultIdx의 userIdx와 넘겨받은 userIdx 값이 같은지 확인
exports.userIdxSameCheck = async function (randomResultIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);


    let randomResultUserIdxCheckResult
    for(var i = 0; i < randomResultIdx.length; i++) {
        randomResultUserIdxCheckResult = await folderDao.selectRandomResultUserIdx(connection, randomResultIdx[i]);

        if(!randomResultUserIdxCheckResult) {
            randomResultUserIdxCheckResult = 'empty';
            break;
        }
        else if(userIdx != randomResultUserIdxCheckResult.userIdx){
            randomResultUserIdxCheckResult = 'error';
            break;
        }
    }
    connection.release();
    return randomResultUserIdxCheckResult;
}

//12
exports.retrieveCountInFolder = async function (folderIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    const countInFolder = await folderDao.selectRandomResultIdxInFolder(connection, folderIdx);

    connection.release();
    return countInFolder;
}

//12
exports.retrieveRandomResultIdxInFolder = async function (folderIdx, plus_randomResultIdx, minus_randomResultIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    const randomResultIdxInFolder = await folderDao.selectRandomResultIdxInFolder(connection, folderIdx);

    //1 true가 디폴트.
    let plus_error = 1;
    let minus_error = 1;
    let rRIdxArray = [];

    for(var i = 0; i < randomResultIdxInFolder.length; i++)
        rRIdxArray.push(randomResultIdxInFolder[i].randomResultIdx)

    for(var i = 0; i < plus_randomResultIdx.length; i++){
        if(rRIdxArray.includes(plus_randomResultIdx[i])){
            plus_error = 0;
            break;
        }
    }

    for(var i = 0; minus_randomResultIdx.length; i++){
        //true일 때 조건문이 실행되므로 false일 때, !로 true로 바꾸어줌.
        if(!randomResultIdxInFolder.includes(minus_randomResultIdx[i])){
            minus_error = 0;
            break;
        }
    }

    connection.release();
    return [plus_error, minus_error];
}

//[포뇨]validation_ randomResultIdx의 userIdx와 넘겨받은 userIdx 값이 같은지 확인인데 넘어오는 randomResultIdx가 배열아니고 하나짜리임
exports.userIdxSameCheck_Each = async function (randomResultIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    let randomResultUserIdxCheckResult = await folderDao.selectRandomResultUserIdx(connection, randomResultIdx);

    if(!randomResultUserIdxCheckResult){
        randomResultUserIdxCheckResult = 'empty'}
    else if(userIdx != randomResultUserIdxCheckResult.userIdx){
        randomResultUserIdxCheckResult = 'error';}

    connection.release();
    return randomResultUserIdxCheckResult;
}

//13,14 validation_ folderIdx의 userIdx와 넘겨받은 userIdx 값이 같은지 확인
exports.userIdxSameCheck_Folder = async function(folderIdx, userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);

    let folderUserIdxCheckResult = await folderDao.selectFolderUserIdx(connection, folderIdx);

    if(!folderUserIdxCheckResult)
        folderUserIdxCheckResult = 'empty';
    else if(userIdx != folderUserIdxCheckResult.userIdx)
        folderUserIdxCheckResult = 'error';

    connection.release();
    return folderUserIdxCheckResult;
}

//14 validation_ userIdx 존재하는지 체크
exports.userIdxCheck = async function (userIdx) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userIdxCheckResult = await folderDao.selectUserIdx(connection, userIdx);
  
    connection.release();
  
    return userIdxCheckResult;
  }

//14 validation_ folderIdx 존재하는지 체크
exports.folderIdxCheck = async function (folderIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const folderIdxCheckResult = await folderDao.selectFolderIdx(connection, folderIdx);

  connection.release();

  return folderIdxCheckResult;
}