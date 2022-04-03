//6
async function insertRandomResult(connection, insertRandomResultParams) {
    const insertUserInfoQuery = `
        INSERT INTO RandomResult(userIdx, randomResultContent, randomResultType)
        VALUES (?, ?, ?);
    `;
    const insertUserInfoRow = await connection.query(
        insertUserInfoQuery, insertRandomResultParams
    );

    return insertUserInfoRow;
}

//17
//개별
async function deleteRecording(connection, randomResultIdx) {
    const deleteRecordingQuery = `
        DELETE FROM Recording
        WHERE randomResultIdx in (SELECT sub.randomResult
                                  FROM (SELECT A.randomResultIdx as randomResult
                                        FROM Recording A join RandomResult B
                                        ON A.randomResultIdx = B.randomResultIdx
                                        WHERE A.randomResultIdx = ?) sub);
    `;

    const deleteRecordingRow = await connection.query(deleteRecordingQuery, randomResultIdx);
    return deleteRecordingRow[0];
}
async function deleteRecordingImg(connection, randomResultIdx) {
    const deleteRandomResultImgQuery = `
        DELETE FROM RecordingImg
        WHERE recordingIdx in (SELECT sub.recordingIdx
                               FROM (SELECT I.recordingIdx as recordingIdx
                                     FROM Recording R join RecordingImg I
                                     on R.recordingIdx=I.recordingIdx
                                     WHERE R.randomResultIdx = ?) sub);
    `;

    const deleteRecordingImgRow = await connection.query(deleteRandomResultImgQuery, randomResultIdx);
    return deleteRecordingImgRow[0];
}
async function deleteRandomResult(connection, randomResultIdx) {
    const deleteRandomResultQuery = `
        DELETE FROM RandomResult
        WHERE randomResultIdx = ?;
    `;

    const deleteRecordingRow = await connection.query(deleteRandomResultQuery, randomResultIdx);
    return deleteRecordingRow[0];
}

//폴더
async function deleteEachRecordingFolder(connection, folderIdx) {
    const deleteRecordingFolderQuery = `
        DELETE FROM Recording
        WHERE randomResultIdx in (SELECT sub.randomResult
                                  FROM (
                                      SELECT A.randomResultIdx as randomResult
                                      FROM Recording A join RandomResult B
                                      ON A.randomResultIdx = B.randomResultIdx
                                      WHERE B.folderIdx = ? ) sub);
    `;

    const deleteRecordingFolderRow = await connection.query(deleteRecordingFolderQuery, folderIdx);
    return deleteRecordingFolderRow[0];
}
async function deleteEachRecordingImgFolder(connection, folderIdx) {
    const deleteEachRecordingImgQuery = `
        DELETE FROM RecordingImg 
        WHERE recordingIdx in (SELECT recordingIdx
                               FROM Recording
                               WHERE randomResultIdx in (SELECT randomResultIdx
                                                         FROM RandomResult
                                                         WHERE folderIdx=?)
        );
    `;

    /*
    DELETE FROM RecordingImg //3. 2번에서 알아낸 recordingIdx에 해당하는 img항목들을 삭제함
    WHERE recordingIdx in (SELECT recordingIdx //2.그 항목들이 recording을 갖을 때, 그 recordingIdx를 알아내고
                            FROM Recording
                            WHERE randomResultIdx in (SELECT randomResultIdx //1.해당 폴더에 엮여있는 개별 항목 idx 알아내고
                                                        FROM RandomResult
                                                        WHERE folderIdx=?)
    );
    */
    const deleteEachRecordingImgRow = await connection.query(deleteEachRecordingImgQuery, folderIdx);
    return deleteEachRecordingImgRow[0];
}
async function deleteRandomResultFolder(connection, folderIdx) {
    const deleteRandomResultQuery = `
        DELETE FROM RandomResult
        WHERE folderIdx = ?;
    `;

    const deleteRecordingRow = await connection.query(deleteRandomResultQuery, folderIdx);
    return deleteRecordingRow[0];
}
async function deleteRecordingFolder(connection, folderIdx) {
    const deleteRandomResultQuery = `
        DELETE FROM Recording
        WHERE folderIdx = ?;
    `;

    const deleteRecordingRow = await connection.query(deleteRandomResultQuery, folderIdx);
    return deleteRecordingRow[0];
}
async function deleteRecordingImgFolder(connection, folderIdx) {
    const deleteRecordingImgQuery = `
        DELETE FROM RecordingImg
        WHERE recordingIdx in (SELECT sub.recordingIdx
                               FROM (SELECT I.recordingIdx recordingIdx
                                     FROM Recording R join RecordingImg I
                                     ON R.recordingIdx = I.recordingIdx
                                     WHERE R.folderIdx = ? ) sub);
    `;
    const deleteRecordingImgRow = await connection.query(deleteRecordingImgQuery, folderIdx);
    return deleteRecordingImgRow[0];
}
async function deleteFolder(connection, folderIdx) {
    const deleteFolderQuery = `
        DELETE FROM Folder
        WHERE folderIdx = ?;
    `;

    const deleteRecordingRow = await connection.query(deleteFolderQuery, folderIdx);
    return deleteRecordingRow[0];
}

module.exports = {
    //6
    insertRandomResult,

    //17
    deleteRecording, //1
    deleteRecordingImg, //1+
    deleteRandomResult, //2

    deleteEachRecordingFolder, //1
    deleteEachRecordingImgFolder, //1+
    deleteRandomResultFolder, //2
    deleteRecordingFolder, //3
    deleteRecordingImgFolder, //3+
    deleteFolder, //4
};
