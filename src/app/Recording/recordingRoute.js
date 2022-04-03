module.exports = function(app) {
    const recording = require("./recordingController");
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // 0. 테스트 API
    app.get('/app/test', recording.getTest);

    // 9-1. 해당 날짜의 뽑기 개수 조회 API
    app.get('/app/randomresultcount/:date', jwtMiddleware, recording.getRandomResultCount);

    //10. 기록하자_날짜별리스트업_폴더
    app.get('/app/recordingList/folder/:date', jwtMiddleware, recording.getFolderList);

    //10-1. 기록하자_날짜별리스트업_개별
    app.get('/app/recordingList/each/:date', jwtMiddleware, recording.getEachList);

    // 14-1. 폴더 기록하자 기록 API
    app.post('/app/folderrecording/:folderIdx', jwtMiddleware, recording.postFolderRecording);

    // 14-2. 개별 기록하자 기록 API
    app.post('/app/eachrecording/:randomResultIdx', jwtMiddleware, recording.postEachRecording);

    //15.기록화면B 폴더의 기록 조회 API
    app.get('/app/recording/folder/:folderIdx', jwtMiddleware, recording.getFolderContent);

    //15-1. 기록화면B 개별의 기록 조회 API
    app.get('/app/recording/eachContent/:randomResultIdx', jwtMiddleware, recording.getEachContent);

    //16. 기록화면B 폴더의 기록 수정 API
    app.patch('/app/recording/folderCorrection/:folderIdx', jwtMiddleware, recording.patchFolderContent);

    //16-1. 기록화면B 개별의 기록 수정 API
    app.patch('/app/recording/eachCorrection/:randomResultIdx', jwtMiddleware, recording.patchEachContent);

    //18-1. 기록화면B 폴더 기록 삭제 API
    app.patch('/app/recording/folderrecorddeletion/:folderIdx', jwtMiddleware, recording.deleteFolderRecording);

    //18-2. 기록화면B 개별 기록 삭제 API
    app.patch('/app/recording/eachrecorddeletion/:randomResultIdx', jwtMiddleware, recording.deleteEachRecording);

}
