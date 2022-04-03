const { http } = require('winston');

module.exports = function(app) {
    const user = require('./userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    const auth = require('./userController');

    // 1. 로그인 API
    app.post('/auth/naver', auth.getNaverJWT);

    //1-1. 자동 로그인 API
    app.get('/app/user/autologin', jwtMiddleware, user.getautoLogin);

    // 2. 로그아웃 API
    app.get('/app/user/logout', jwtMiddleware, user.logoutUser);

    //3. 회원탈퇴 API
    app.post('/app/withdrawal', jwtMiddleware, user.deleteUserInfo);

    //4. 특정 유저의 닉네임 조회 API
    app.get('/app/user/nickname', jwtMiddleware, user.getNickname);

    //5. 특정 유저의 닉네임 수정 API
    app.patch('/app/user/newNickname', jwtMiddleware, user.patchNickname);

    //8. '케융 님의 모험'_캘린더
    app.get('/app/user/nicknameAdventure', jwtMiddleware, user.getNicknameAdventure);
}

