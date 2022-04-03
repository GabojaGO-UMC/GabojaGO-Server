
//10. 해당 날짜의 folderIdx 조회
async function selectFolderIdx(connection, selectFolderIdxParams) {
    const selectFolderIdxQuery = `
        SELECT DISTINCT folderIdx
        FROM RandomResult
        WHERE DATE(createAt) = ? AND userIdx = ? AND folderIdx IS NOT NULL
        ORDER BY folderIdx ASC;
    `;
    const [folderIdxRows] = await connection.query(selectFolderIdxQuery, selectFolderIdxParams);
    return folderIdxRows;
}

// //10. 해당 날짜_folderIdx에 해당하는 폴더제목, 기록여부 조회
// async function selectRecordingPage_folder(connection, folderIdx) {
//     const selectRecordingPageQuery = `
//         SELECT a.folderIdx, a.randomResultIdx, a.randomResultType, a.randomResultContent, DATE_FORMAT(a.createAt,'%H:%i') AS createAt, b.recordingTitle
//         From RandomResult a
//         LEFT  JOIN Recording b
//         ON a.folderIdx = b.folderIdx
//         Where a.folderIdx = ?;
//     `;
// }

//10. 해당 날짜_folderIdx에 해당하는 뽑기 결과 리스트 조회
async function selectRecordingPage_folder(connection, folderIdx) {
    const selectRecordingPageQuery = `
        SELECT randomResultIdx, randomResultType, randomResultContent, DATE_FORMAT(createAt,'%H:%i') AS createAt
        From RandomResult
        Where folderIdx = ?
        ORDER BY randomResultIdx ASC;
    `;
    const [selectRecordingPageRows] = await connection.query(selectRecordingPageQuery, folderIdx);
    return selectRecordingPageRows;
}

//10. 해당 날짜_folderIdx의 기록여부 확인_recordingTitle 조회
async function selectRecordingIdx_folder(connection, folderIdx) {
    const selectRecordingIdxQuery = `
        SELECT recordingTitle
        FROM Recording
        WHERE folderIdx = ?;
    `;
    const [selectRecordingIdxRows] = await connection.query(selectRecordingIdxQuery, folderIdx);
    return selectRecordingIdxRows[0];
}

//10-1. 해당 날짜의 randomResultIdx 조회
async function selectRandomResultIdx(connection, selectRandomResultIdxParams) {
    const selectRandomResultIdxQuery = `
        SELECT randomResultIdx
        FROM RandomResult
        WHERE DATE(createAt) = ? AND userIdx = ? AND folderIdx IS NULL;
    `;
    const [randomResultIdxRows] = await connection.query(selectRandomResultIdxQuery, selectRandomResultIdxParams);
    return randomResultIdxRows;
}

//10-1. 해당 날짜_randomResultIdx에 해당하는 뽑기결과, 날짜 조회
async function selectRecordingPage_each(connection, randomResultIdx) {
    const selectRecordingPageQuery = `
        SELECT randomResultIdx, randomResultType, randomResultContent, DATE_FORMAT(createAt,'%H:%i') AS createAt
        From RandomResult
        WHERE randomResultIdx = ?;
    `;
    const [selectRecordingPageRows] = await connection.query(selectRecordingPageQuery, randomResultIdx);
    return selectRecordingPageRows[0];
}

//10-1. 해당 날짜_randomResultIdx에 recordingIdx 있는지 확인
async function selectRecordingIdx_each(connection, randomResultIdx) {
    const selectRecordingIdxQuery = `
        SELECT recordingIdx
        FROM Recording
        WHERE randomResultIdx = ?;
    `;
    const [selectRecordingIdxRows] = await connection.query(selectRecordingIdxQuery, randomResultIdx);
    return selectRecordingIdxRows[0];
}

// 14-1. 폴더 기록 등록
async function insertFolderRecording(connection, insertFolderRecordingParams) {
    const insertFolderRecordingQuery = `
          INSERT INTO Recording(folderIdx, recordingStar, recordingContent, recordingTitle)
          VALUES (?, ?, ?, ?);
      `;
    const [insertFolderRecordingRow] = await connection.query(
      insertFolderRecordingQuery,
      insertFolderRecordingParams
    );
  
    return insertFolderRecordingRow;
}

// 14-2. 개별 기록 등록
async function insertEachRecording(connection, insertEachRecordingParams) {
    const insertEachRecordingQuery = `
          INSERT INTO Recording(randomResultIdx, recordingStar, recordingContent, recordingTitle)
          VALUES (?, ?, ?, ?);
      `;
    const [insertEachRecordingRow] = await connection.query(
      insertEachRecordingQuery,
      insertEachRecordingParams
    );
    return insertEachRecordingRow;
}

//folderIdx가 실제로 맞는지 벨리데이션
async function selectFolderUserIdx(connection, folderIdx) {
    const selectFolderUserIdxQuery = `
        SELECT userIdx
        FROM Folder
        WHERE folderIdx = ?;
    `;
    const [selectFolderUserIdxRows] = await connection.query(selectFolderUserIdxQuery, folderIdx);
    return selectFolderUserIdxRows[0];
}

//randomResultIdx가 실제로 맞는지 벨리데이션
async function selectRandomResultUserIdx(connection, randomResultIdx) {
    const selectUserIdxQuery = `
        SELECT userIdx
        FROM RandomResult
        WHERE randomResultIdx = ?;
    `;
    const [selectUserIdxRows] = await connection.query(selectUserIdxQuery, randomResultIdx);
    return selectUserIdxRows;
}

//15.기록화면B 폴더의 기록 조회 API
async function selectFolderContent(connection, folderIdx){
    const selectFolderContentQuery = `
                SELECT R.recordingStar, R.recordingContent, R.recordingTitle
                FROM Folder as F join Recording as R
                on F.folderIdx = R.folderIdx
                WHERE R.folderIdx = ?;
                `;
    const [folderContentRows] = await connection.query(selectFolderContentQuery, folderIdx);

    return folderContentRows[0];
}

async function selectFolderImgList(connection, folderIdx){ //imgUrl도 보내줘야함
    const selectFolderImgQuery = `
                SELECT I.recordingImgUrl
                FROM Folder as F join Recording as R join RecordingImg as I
                on F.folderIdx = R.folderIdx and R.recordingIdx = I.recordingIdx
                WHERE R.folderIdx = ?;
                `;
    const [folderImgRows] = await connection.query(selectFolderImgQuery, folderIdx);
    return folderImgRows;
}
async function selectFolderRandomResult(connection, folderIdx){
    const selectFolderRandomResultQuery = `
        SELECT DATE_FORMAT(R.createAt,'%H:%i') as createAt, R.randomResultContent, R.randomResultType
        FROM Folder as F join RandomResult as R
        on F.folderIdx = R.folderIdx
        WHERE R.folderIdx = ?;
    `;
    const [folderRandomResultRows] = await connection.query(selectFolderRandomResultQuery, folderIdx);

    return folderRandomResultRows;
}

//15-1. 기록화면B 개별의 기록 조회 API
async function selectEachContent(connection, randomResultIdx){
    const selectEachContentQuery = `
                SELECT b.recordingStar, b.recordingContent, b.recordingTitle
                FROM RandomResult as a join Recording as b 
                on a.randomResultIdx = b.randomResultIdx 
                WHERE a.randomResultIdx = ?;
                `;
    const [eachContentRows] = await connection.query(selectEachContentQuery, randomResultIdx);
    return eachContentRows[0];
}
async function selectEachImgList(connection, randomResultIdx){
    const selectEachImgQuery = `
                SELECT I.recordingImgUrl
                FROM RandomResult as A join Recording as R join RecordingImg as I
                on A.randomResultIdx = R.randomResultIdx and R.recordingIdx = I.recordingIdx
                WHERE R.randomResultIdx = ?;
                `;
    const [eachImgRows] = await connection.query(selectEachImgQuery, randomResultIdx);
    return eachImgRows;
}
async function selectEachRandomResult(connection, randomResultIdx){
    const selectEachRandomResultQuery = `
        SELECT DATE_FORMAT(R.createAt,'%H:%i') as createAt, R.randomResultContent, R.randomResultType
        FROM RandomResult as R
        WHERE R.randomResultIdx = ?;
    `;
    const [eachRandomResultRows] = await connection.query(selectEachRandomResultQuery, randomResultIdx);
    return eachRandomResultRows[0];
}

//16. 기록화면B 폴더의 기록 수정 API
async function updateFolderContent(connection, editFolderParams){
    const updateFolderContentQuery = `
                UPDATE Recording
                SET recordingStar = ?, recordingContent = ?, recordingTitle=?
                WHERE folderIdx = ?;
                `;
    const [eachContentRows] = await connection.query(updateFolderContentQuery, editFolderParams);
    return eachContentRows;
}
//img삭제
async function deleteImgUrl(connection, folderIdx){
    const deleteImgUrlQuery = `
                DELETE FROM RecordingImg
                WHERE recordingIdx = (SELECT recordingIdx
                                        FROM Recording
                                        WHERE folderIdx=?);
                `;
    const [deleteImgUrlRows] = await connection.query(deleteImgUrlQuery, folderIdx);
    return deleteImgUrlRows;
}
//img생성
async function insertImgUrl(connection, insertImgUrlParams) {
    const insertImgUrlQuery = `
          INSERT INTO RecordingImg(recordingIdx, recordingImgUrl)
          VALUES ((SELECT recordingIdx FROM Recording WHERE folderIdx=?), ?);
      `;
    const [insertImgUrlRow] = await connection.query(insertImgUrlQuery, insertImgUrlParams);

    return insertImgUrlRow;
}

//16-1. 기록화면B 개별의 기록 수정 API
async function updateEachContent(connection, editEachParams){
    const updateEachContentQuery = `
                UPDATE Recording
                SET recordingStar = ?, recordingContent = ?, recordingTitle=?
                WHERE randomResultIdx = ?;
                `;
    const [eachContentRows] = await connection.query(updateEachContentQuery, editEachParams);
    return eachContentRows;
}
//img삭제
async function deleteImgUrlEach(connection, randomResultIdx){
    const deleteImgUrlQuery = `
                DELETE FROM RecordingImg
                WHERE recordingIdx = (SELECT recordingIdx
                                        FROM Recording
                                        WHERE randomResultIdx=?);
                `;
    const [deleteImgUrlEachRows] = await connection.query(deleteImgUrlQuery, randomResultIdx);
    return deleteImgUrlEachRows;
}
//img생성
async function insertImgUrlEach(connection, insertImgUrlParams) {
    const insertImgUrlQuery = `
          INSERT INTO RecordingImg(recordingIdx, recordingImgUrl)
          VALUES ((SELECT recordingIdx FROM Recording WHERE randomResultIdx=?), ?);
      `;
    const [insertImgUrlEachRow] = await connection.query(insertImgUrlQuery, insertImgUrlParams);

    return insertImgUrlEachRow;
}

// 폴더Idx 존재 여부 확인
async function selectFolderExist(connection, folderIdx){
    const selectFolderExistQuery = `
                SELECT folderIdx
                FROM Recording
                WHERE folderIdx = ?;
                `;
    const [folderExistRows] = await connection.query(selectFolderExistQuery, folderIdx);
    return folderExistRows[0];
}

// 개별Idx 존재 여부 확인
async function selectEachExist(connection, randomResultIdx){
    const selectEachExistQuery = `
                SELECT randomResultIdx
                FROM Recording
                WHERE randomResultIdx = ?;
                `;
    const [eachExistRows] = await connection.query(selectEachExistQuery, randomResultIdx);
    return eachExistRows[0];
}

module.exports = {

    selectRandomResultIdx, //10, 10-1
    selectRecordingPage_each,
    selectRecordingIdx_each,
    selectFolderIdx,
    selectRecordingPage_folder,
    selectRecordingIdx_folder,

    insertFolderRecording,
    insertEachRecording,

    selectFolderUserIdx, //벨리데이션
    selectRandomResultUserIdx,

    selectFolderContent, //15
    selectFolderRandomResult,
    selectFolderImgList,

    selectEachContent, //15-1
    selectEachRandomResult,
    selectEachImgList,

    updateFolderContent, //16
    deleteImgUrl,
    insertImgUrl,

    updateEachContent, //16-1
    deleteImgUrlEach,
    insertImgUrlEach,

    selectFolderExist, //벨리데이션
    selectEachExist //벨리데이션
};
