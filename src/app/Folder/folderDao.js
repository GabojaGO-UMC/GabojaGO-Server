
// 7, 9, 10. 유저가 가입한 날(달) 정보 제공
async function selectUserJoinDate(connection, userIdx) {
    const selectUserJoinDateQuery = `
    SELECT createAt as 'joindate' FROM User WHERE userIdx = ? AND status = 'active';
                  `;
    const [UserJoinDateRows] = await connection.query(selectUserJoinDateQuery, userIdx);
    return UserJoinDateRows[0]['joindate'];
  }

// 7. 해당 년월의 유저 뽑기 날짜들 가져오기 - 캘린더 모험횟수 표시
async function selectRandomResultDateList(connection, selectRandomResultDateListParams) {
    const selectRandomResultDateListQuery = `
    SELECT DISTINCT DAY(createAt) as 'day' FROM RandomResult WHERE userIdx = ? AND EXTRACT(YEAR_MONTH FROM createAt) = ? AND status = 'active';
      `;
      const [RandomResultDateRows] = await connection.query(selectRandomResultDateListQuery, selectRandomResultDateListParams);
      return RandomResultDateRows;
    }
  
// 9. 해당 월의 유저 총 모험 횟수 가져오기
async function selectMonthlyAdventureTimes(connection, selectMonthlyAdventureTimesParams) {
    const selectMonthlyAdventureTimesQuery = `
    SELECT count(*) as 'advtimes' FROM RandomResult WHERE userIdx = ? AND EXTRACT(YEAR_MONTH FROM createAt) = ? AND status = 'active';
                  `;
    const [MonthlyAdventureTimesRows] = await connection.query(selectMonthlyAdventureTimesQuery, selectMonthlyAdventureTimesParams);
    return MonthlyAdventureTimesRows[0]['advtimes'];
  }
  
// 10. 해당 날짜의 뽑기기록 가져오기
async function selectRandomResultList(connection, selectRandomResultListParams) {
      const selectRandomResultListQuery = `
      SELECT * FROM RandomResult WHERE userIdx = ? AND DATE(createAt) = ? AND status = 'active';
                    `;
      const [RandomResultRows] = await connection.query(selectRandomResultListQuery, selectRandomResultListParams);
      return RandomResultRows;
    }

// 10. 해당 날짜의 뽑기 개수 조회
async function selectRandomResultCount(connection, selectRandomResultCountParams) {
  const selectRandomResultCountQuery = `
  SELECT count(*) as 'rrcount' FROM RandomResult WHERE userIdx = ? AND DATE(createAt) = ? AND status = 'active';
                `;
  const [RandomResultCountRows] = await connection.query(selectRandomResultCountQuery, selectRandomResultCountParams);
  return RandomResultCountRows[0]['rrcount'];
}

//11-1. folderIdx= null 인지 확인
async function selectRandomResultFolderIdx(connection, randomResultIdx) {
    const selectFolderIdxQuery = `
        SELECT folderIdx
        FROM RandomResult
        WHERE randomResultIdx = ?;
    `;
    const [selectFolderIdxRows] = await connection.query(selectFolderIdxQuery, randomResultIdx);
    return selectFolderIdxRows;
}

//11,14. randomReseultIdx의 userIdx 값이 실제 userIdx 값과 같은지 확인
async function selectRandomResultUserIdx(connection, randomResultIdx) {
    const selectUserIdxQuery = `
        SELECT userIdx
        FROM RandomResult
        WHERE randomResultIdx = ?;
    `;
    const [selectUserIdxRows] = await connection.query(selectUserIdxQuery, randomResultIdx);
    return selectUserIdxRows[0];
}

//11-3. 폴더 생성
async function insertFolder(connection, userIdx) {
    const insertFolderQuery = `
        INSERT INTO Folder (userIdx)
        VALUES (?);
    `;
    const insertFolderRows = await connection.query(insertFolderQuery, userIdx);
    return insertFolderRows;
}

//11-4. randomResult folderIdx 값 수정
async function updateRandomResultFolderIdx(connection, folderIdx, randomResultIdx) {
    const updateRandomResultFolderIdxQuery = `
        UPDATE RandomResult
        SET folderIdx = ?
        WHERE randomResultIdx = ?;
    `;
    const updateRandomResultFolderIdxRows = await connection.query(updateRandomResultFolderIdxQuery, [folderIdx, randomResultIdx]);
    return updateRandomResultFolderIdxRows;
}

//12-0. 폴더 내 항목 개수 체크
async function selectRandomResultIdxInFolder(connection, folderIdx) {
    const selectRandomResultIdxInFolderQuery = `
        SELECT randomResultIdx
        FROM RandomResult
        WHERE folderIdx = ?;
    `;
    const [selectRandomResultIdxInFolderRows] = await connection.query(selectRandomResultIdxInFolderQuery, folderIdx);
    return selectRandomResultIdxInFolderRows;
}

//12-1. 폴더 수정 _ 항목 추가
async function update_plusFolder(connection, folderIdx, plus_randomResultIdx) {
    const updatePlusRandomResultInFolderQuery = `
        UPDATE RandomResult
        SET folderIdx = ?
        WHERE randomResultIdx = ?;
    `;

    const updatePlusRandomResultInFolderRows = await connection.query(updatePlusRandomResultInFolderQuery, [folderIdx, plus_randomResultIdx]);
    return updatePlusRandomResultInFolderRows;
}

//12-2. 폴더 수정 _ 항목 빼기
async function update_minusFolder(connection, minus_randomResultIdx) {
    const updateMinusRandomResultInFolderQuery = `
        UPDATE RandomResult
        SET folderIdx = NULL
        WHERE randomResultIdx = ?;
    `;

    const updateMinusRandomResultInFolderRows = await connection.query(updateMinusRandomResultInFolderQuery, minus_randomResultIdx);
    return updateMinusRandomResultInFolderRows;
}

//13,14. folderIdx의 userIdx 값과 넘겨받은 userIdx 값이 같은지 확인
async function selectFolderUserIdx(connection, folderIdx) {
    const selectFolderUserIdxQuery = `
        SELECT userIdx
        FROM Folder
        WHERE folderIdx = ?;
    `;
    const [selectFolderUserIdxRows] = await connection.query(selectFolderUserIdxQuery, folderIdx);
    return selectFolderUserIdxRows[0];
}

//13-1. 폴더 해체 _ Folder _folderIdx 튜플 삭제
async function deleteFolderTuple(connection, folderIdx) {
    const deleteFolderQuery = `
        DELETE FROM Folder
        WHERE folderIdx = ?;
    `;
    const [deleteFolderTupleRows] = await connection.query(deleteFolderQuery, folderIdx);
    return deleteFolderTupleRows;
}

//13-2. 폴더 해체 _ RandomResult _ folderIdx 값 변경
async function update_deleteRandomResultFolderIdx(connection, folderIdx) {
    const update_deleteFolderIdxQuery = `
        UPDATE RandomResult
        SET folderIdx = NULL
        WHERE folderIdx = ?;
    `;
    const [update_deleteFolderIdxRows] = await connection.query(update_deleteFolderIdxQuery, folderIdx);
    return update_deleteFolderIdxRows;
}

//13-3. 폴더 해체 _ Recording _ 튜플 삭제
async function deleteFolderRecordingTuple(connection, folderIdx) {
    const deleteFolderRecordingQuery = `
        DELETE FROM Recording
        WHERE folderIdx = ?;
    `;

    const [deleteFolderRecordingRows] = await connection.query(deleteFolderRecordingQuery, folderIdx);
    return deleteFolderRecordingRows;

}

// 14 validation. userIdx 값 체크
async function selectUserIdx(connection, userIdx) {
    const selectUserIdxQuery = `
        SELECT userIdx
        FROM User 
        WHERE userIdx = ?;
    `;
    const [selectUserIdxRows] = await connection.query(selectUserIdxQuery, userIdx);
    return selectUserIdxRows;
  }
  
// 14 validation. folderIdx 값 체크
async function selectFolderIdx(connection, folderIdx) {
    const selectFolderIdxQuery = `
        SELECT folderIdx
        FROM Recording 
        WHERE folderIdx = ?;
    `;
    const [selectFolderIdxRows] = await connection.query(selectFolderIdxQuery, folderIdx);
    return selectFolderIdxRows;
  }

// 14 validation. randomResultIdx 값 체크
async function selectRandomResultIdx(connection, randomResultIdx) {
    const selectFolderIdxQuery = `
        SELECT randomResultIdx
        FROM Recording 
        WHERE randomResultIdx = ?;
    `;
    const [selectRandomResultIdxRows] = await connection.query(selectFolderIdxQuery, randomResultIdx);
    return selectRandomResultIdxRows;
  } 

module.exports = {
    selectUserJoinDate,
    insertFolder,
    selectRandomResultUserIdx,
    updateRandomResultFolderIdx,
    selectRandomResultFolderIdx,
    deleteFolderTuple,
    update_deleteRandomResultFolderIdx,
    deleteFolderRecordingTuple,
    selectFolderUserIdx,
    selectRandomResultDateList,
    selectRandomResultList,
    selectRandomResultCount,
    selectMonthlyAdventureTimes,
    selectUserIdx,
    selectFolderIdx,
    selectRandomResultIdx,
    update_plusFolder,
    update_minusFolder,
    selectRandomResultIdxInFolder
};