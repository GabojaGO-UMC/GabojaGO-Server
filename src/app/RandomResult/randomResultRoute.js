module.exports = function(app) {
    const randomResult = require('./randomResultController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //6. 뽑기기록 저장
    app.post('/app/randomResult', jwtMiddleware, randomResult.postRandomResult);

    //17. 뽑기기록 삭제
    app.delete('/app/randomResult', jwtMiddleware, randomResult.deleteRandomResult);
}