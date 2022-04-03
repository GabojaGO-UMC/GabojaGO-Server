
// 1. 이메일로 회원 조회 - 네이버로그인
async function getUserInfo(connection, email) {
    const getUserInfoQuery = `
                  SELECT userIdx
                  FROM User 
                  WHERE userEmail = ?;
                  `;
    const [emailRows] = await connection.query(getUserInfoQuery, email);
    //console.log(emailRows);
    return emailRows;
  }
  
  
// 1. 새 유저 등록 - 네이버로그인
async function insertUserInfo(connection, insertUserInfoParams) {
    const insertUserInfoQuery = `
          INSERT INTO User(userNickName, userName, userEmail)
          VALUES (?, ?, ?);
      `;
    const insertUserInfoRow = await connection.query(
      insertUserInfoQuery,
      insertUserInfoParams
    );
  
    return insertUserInfoRow;
  }

// 1. 발급한 jwt 저장 - 네이버로그인
async function updateUserToken(connection, updateUserTokenParams) {
    const updateUserTokenQuery = `
        UPDATE User
        SET token = ?
        WHERE userIdx = ?;
    `;
    const updateUserTokenRows = await connection.query(updateUserTokenQuery, updateUserTokenParams);
    return updateUserTokenRows;
}

// jwtMiddleware - 올바른 접근 확인
async function selectUserToken(connection, userIdx) {
    const selectUserTokenQuery = `
                  SELECT token
                  FROM User 
                  WHERE userIdx = ?;
                  `;
    const [selectUserTokenRows] = await connection.query(selectUserTokenQuery, userIdx);
    return selectUserTokenRows[0].token;
    //return selectUserTokenRows;
  }

//0. userIdx 값 체크
async function selectUserIdx(connection, userIdx) {
    const selectUserIdxQuery = `
        SELECT userIdx
        FROM User 
        WHERE userIdx = ?;
    `;
    const [selectUserIdxRows] = await connection.query(selectUserIdxQuery, userIdx);
    return selectUserIdxRows[0];
}

// 2. 로그아웃, 3. 회원탈퇴 - 토큰 삭제
async function eraseUserToken(connection, userIdx) {
    const eraseUserTokenQuery = `
        UPDATE User
        SET token = NULL
        WHERE userIdx = ?;
    `;
    const eraseUserTokenRows = await connection.query(eraseUserTokenQuery, userIdx);
    return eraseUserTokenRows;
  }

//3. 회원탈퇴 API
async function updateUserEmail(connection, userIdx) {
    const updateUserEmailQuery = `
        UPDATE User
        SET userEmail = NULL
        WHERE userIdx = ?;
    `;
    const editUserEmailRows = await connection.query(updateUserEmailQuery, userIdx);
    return editUserEmailRows;
}
//폴더관련이미지삭제
async function deleteFolderRecordingImg(connection, userIdx) {
    const deleteFolderRecordingImgQuery = `
        DELETE FROM RecordingImg
        WHERE recordingIdx in (SELECT recordingIdx
                                FROM Recording
                                WHERE folderIdx in (SELECT F.folderIdx
                                                    FROM Folder F join Recording R
                                                    ON F.folderIdx = R.folderIdx
                                                    WHERE F.userIdx = ?));
    `;
    const deleteFolderRecordingImgRows = await connection.query(deleteFolderRecordingImgQuery, userIdx);
    return deleteFolderRecordingImgRows;
}
//폴더관련기록삭제
async function deleteFolderRecording(connection, userIdx) {
    const deleteFolderRecordingQuery = `
        DELETE FROM Recording
        WHERE folderIdx in (SELECT sub.req
                            FROM (SELECT F.folderIdx as req
                                  FROM Folder F join Recording R
                                  ON F.folderIdx = R.folderIdx
                                  WHERE F.userIdx = ?) sub);
    `;
    const deleteFolderRecordingRows = await connection.query(deleteFolderRecordingQuery, userIdx);
    return deleteFolderRecordingRows;
}
//폴더삭제
async function deleteFolder(connection, userIdx) {
    const deleteFolderQuery = `
        DELETE FROM Folder
        WHERE userIdx = ?;
    `;
    const deleteFolderRows = await connection.query(deleteFolderQuery, userIdx);
    return deleteFolderRows;
}

//개별관련이미지삭제
async function deleteRandomResultRecordingImg(connection, userIdx) {
    const deleteRandomRecordingImgQuery = `
        DELETE FROM RecordingImg
        WHERE recordingIdx in (SELECT recordingIdx
                               FROM Recording
                               WHERE randomResultIdx in (SELECT A.randomResultIdx
                                                           FROM RandomResult A join Recording B
                                                           ON A.randomResultIdx = B.randomResultIdx
                                                           WHERE A.userIdx = ?));
    `;
    const deleteRandomRecordingImgRows = await connection.query(deleteRandomRecordingImgQuery, userIdx);
    return deleteRandomRecordingImgRows;
}
//개별관련기록삭제
async function deleteRandomResultRecording(connection, userIdx) {
    const deleteRandomRecordingQuery = `
        DELETE FROM Recording
        WHERE randomResultIdx in (SELECT sub.req
                                    FROM (SELECT A.randomResultIdx as req
                                            FROM RandomResult A join Recording B
                                            ON A.randomResultIdx = B.randomResultIdx
                                            WHERE A.userIdx = ?) sub);
    `;
    const deleteRandomRecordingRows = await connection.query(deleteRandomRecordingQuery, userIdx);
    return deleteRandomRecordingRows;
}
//개별삭제
async function deleteRandomResult(connection, userIdx) {
    const deleteRandomResultQuery = `
        DELETE FROM RandomResult
        WHERE userIdx = ?;
    `;
    const deleteRandomResultRows = await connection.query(deleteRandomResultQuery, userIdx);
    return deleteRandomResultRows;
}

//4. 특정 유저의 닉네임 조회
async function selectUserNickname(connection, userIdx) {
    const selectUserNicknameQuery = `
        SELECT userNickname 
        FROM User 
        WHERE userIdx = ?;
    `;
    const [userNicknameRows] = await connection.query(selectUserNicknameQuery, userIdx);
    return userNicknameRows[0]; //한 명의 닉네임만 가져오는거니까.
}

//5. 특정 유저의 닉네임 수정
async function updateUserNickname(connection, userNickname, userIdx) {
    const updateUserNicknameQuery = `
        UPDATE User
        SET userNickname = ?
        WHERE userIdx = ?;
    `;
    const editUserNicknameRows = await connection.query(updateUserNicknameQuery, [userNickname, userIdx]);
    return editUserNicknameRows;
}

//8. '케융' 님의 모험
async function selectUserNicknameAdventure(connection, userIdx) {
    const selectUserNicknameAdventureQuery = `
        SELECT CONCAT (userNickname, ' 님의 모험') as userNickname_in_calendar
        FROM User 
        WHERE userIdx = ?;
    `;
    const [selectUserNicknameAdventureRows] = await connection.query(selectUserNicknameAdventureQuery, userIdx);
    return selectUserNicknameAdventureRows[0];
}


module.exports = {
    getUserInfo, //1
    insertUserInfo, //1
    updateUserToken, //1
    selectUserToken, //jwt
    selectUserIdx, //0
    eraseUserToken, //2,3
    updateUserEmail, //3
    deleteFolderRecordingImg,
    deleteFolderRecording,
    deleteFolder,
    deleteRandomResultRecordingImg,
    deleteRandomResultRecording,
    deleteRandomResult,
    selectUserNickname, //4
    updateUserNickname, //5
    selectUserNicknameAdventure //8

};
