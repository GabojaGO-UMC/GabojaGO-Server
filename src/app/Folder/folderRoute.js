module.exports = function(app) {
    const folder = require('./folderController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');


    // 7. 캘린더 조회 API
    app.get('/app/calendar/:yearmonth', jwtMiddleware, folder.getRandomResultDateList);

    // 11. 폴더 생성 api
    app.post('/app/folder/new', jwtMiddleware, folder.postFolder);

    // 12. 폴더 수정 api
    app.patch('/app/folder/update', jwtMiddleware, folder.patchFolder);

    // 13. 폴더 해체 api
    app.delete('/app/folder/delete/:folderIdx', jwtMiddleware, folder.deleteFolder);

}