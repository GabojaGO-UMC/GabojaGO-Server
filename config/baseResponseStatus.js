//Response로 보내줄 상태코드와 메세지 등을 이 파일에서 관리함

module.exports = {

    /** Success */
    SUCCESS : { "isSuccess": true, "code": 1000, "message":"성공" },
    NAVER_LOGIN_SUCCESS : { "isSuccess": true, "code": 1100, "message":"네이버 로그인 성공" },
    LOGOUT_SUCCESS : { "isSuccess": true, "code": 1101, "message":"로그아웃 성공" }, //루시 추가 0226
    SIGNUP_SUCCESS : { "isSuccess": true, "code": 1102, "message":"회원가입 성공" }, //루시 추가 0310

    /** Common */
    TOKEN_EMPTY : { "isSuccess": false, "code": 2000, "message":"JWT 토큰을 입력해주세요." },
    TOKEN_VERIFICATION_FAILURE : { "isSuccess": false, "code": 3000, "message":"JWT 토큰 검증 실패" },
    TOKEN_VERIFICATION_SUCCESS : { "isSuccess": true, "code": 1001, "message":"JWT 토큰 검증 성공" },

    /** Request error (2001~) */
    //공통
    VERIFIEDTOKEN_USERIDX_EMPTY : { "isSuccess": false, "code": 2001, "message": "베리파이드토큰 안에 userIdx를 넣어주세요." },
    USER_USERIDX_NOT_EXIST : { "isSuccess": false, "code": 2002, "message": "해당 회원이 존재하지 않습니다." },

    //뽑기 결과 관련 (2003 ~ 2030)
    RANDOMRESULT_CONTENT_EMPTY : { "isSuccess": false, "code": 2003, "message": "저장할 내용을 입력해주세요." },
    RANDOMRESULT_CONTENT_LEGNTH : { "isSuccess": false, "code": 2004, "message": "저장할 내용은 100자 이하로 입력해주세요." },
    RANDOMRESULT_TYPE_EMPTY : { "isSuccess": false, "code": 2005, "message": "저장할 내용의 타입을 입력해주세요." },
    RANDOMRESULT_TYPE_NOT_MATCH : { "isSuccess": false, "code": 2006, "message": "저장할 내용의 타입을 1,2,3,4 중 하나로 입력해주세요." },
    RANDOMRESULT_CONTENT_COUNT : { "isSuccess": false, "code": 2007, "message": "숫자뽑기는 10개 이하만 저장 가능합니다." },
    RANDOMRESULT_RANGE : { "isSuccess": false, "code": 2008, "message": "뽑힌 숫자는 999999보다 작아야 합니다." },

    RANDOMRESULT_DELETE_EMPTY : { "isSuccess": false, "code": 2009, "message": "삭제할 항목을 선택해주세요." }, //폴더, 개별 다 포함

    FOLDER_RANDOMRESULTIDX_EMPTY : {"isSuccess": false, "code": 2010, "message": "폴더로 묶을 항목을 선택해주세요" },
    FOLDER_EDIT_EMPTY : {"isSuccess": false, "code":2011 , "message": "폴더 수정_추가 혹은 제외할 항목을 선택해주세요" },
    FOLDER_FOLDERIDX_EMPTY : {"isSuccess": false, "code":2012 , "message": "수정/삭제할 폴더의 인덱스 값을 입력해주세요" },
    FOLDER_SHOULD_HAVE : {"isSuccess": false, "code":2013 , "message": "폴더 내 항목은 두 개 이상이어야합니다." },
    SHOULD_BE_ARRAY : {"isSuccess": false, "code":2014 , "message": "plus/minus 할 항목을 배열로 묶어주세요." },


    //기록하자 (2031 ~ 2060)
    RECORDING_FOLDERIDX_EMPTY : { "isSuccess": false, "code": 2031, "message": "해당 폴더의 인덱스를 입력해주세요." },
    RECORDING_RANDOMRESULTIDX_EMPTY : { "isSuccess": false, "code": 2032, "message": "해당 항목의 인덱스를 입력해주세요." },

    USER_YEARMONTH_EMPTY : { "isSuccess": false,"code": 2033,"message":"캘린더_조회할 년월을 입력해주세요." },
    USER_DATE_EMPTY : { "isSuccess": false, "code": 2034, "message":"날짜별리스트업_조회할 날짜를 입력해주세요." },

    RECORDING_STAR_RANGE : { "isSuccess": false, "code": 2035, "message": "별점은 5점 이하로 입력해주세요." },
    RECORDING_TITLE_LENGTH : { "isSuccess": false, "code": 2036, "message": "제목은 15자 이하로 입력해주세요." },
    RECORDING_IMG_LENGTH : { "isSuccess": false, "code": 2037, "message": "등록할 수 있는 이미지는 최대 10장입니다." },
    RECORDING_CONTENT_LENGTH : { "isSuccess": false, "code": 2038, "message":"발자취 내용은 1000자 이하로 입력해주세요." },


    RECORDING_STAR_EMPTY : { "isSuccess": false, "code": 2039, "message": "해당 항목의 별점을 입력해주세요." },
    RECORDING_CONTENT_EMPTY : { "isSuccess": false, "code": 2040, "message": "해당 항목의 발자취 내용을 입력해주세요." },
    RECORDING_TITLE_EMPTY : { "isSuccess": false, "code": 2041, "message": "해당 항목의 제목을 입력해주세요." },


    //관리하자 (2061 ~)
    USER_NICKNAME_TOOLONG : {"isSuccess": false, "code": 2061, "message": "닉네임은 25자까지 가능합니다" },
    USER_NICKNAME_EDIT_EMPTY : {"isSuccess": false, "code": 2062, "message": "변경할 닉네임 값을 입력해주세요" },

    /** Response error (3001~) */
    //로그인 관련 (3001 ~ 3005)
    ACCESS_TOKEN_EMPTY : { "isSuccess": false, "code": 3001, "message": "access_token을 입력해주세요." },
    NAVER_LOGIN_ERROR  : { "isSuccess": false, "code": 3002, "message": "네이버 로그인 에러." },
    ACCESS_TOKEN_NOT_VALID  : { "isSuccess": false, "code": 3003, "message": "access_token이 유효하지 않습니다." },
    WRONG_ACCESS : { "isSuccess": false, "code": 3004, "message": "잘못된 접근입니다." }, //루시 추가 0224
    INVALID_TOKEN : { "isSuccess": false, "code": 3005, "message": "유효하지 않은 JWT입니다." }, //루시 추가 0225

    //공통 (3006 ~ 3015)
    FOLDER_WRONG_USERIDX : {"isSuccess": false, "code": 3006, "message": "해당 유저의 폴더가 아닙니다." },
    RANDOMRESULT_WRONG_USERIDX : {"isSuccess": false, "code": 3007, "message": "해당 유저의 뽑기 항목이 아닙니다" },

    //뽑기 결과 관련 (3016 ~ 3030)
    FOLDER_FOLDERIDX_NOTNULL : {"isSuccess": false, "code": 3016, "message": "이미 다른 폴더에 포함된 항목입니다" },
    FOLDER_NOT_EXIST : {"isSuccess": false, "code": 3017 , "message": "존재하지 않는 폴더입니다" },
    RANDOMRESULT_NOT_EXIST  : {"isSuccess": false, "code": 3018, "message": "존재하지 않는 뽑기결과 항목입니다" },

    //기록하자 (3031 ~ 3070)
    FOLDER_RANDOMRESULTDATELIST_NOT_EXIST : { "isSuccess": false, "code": 3031, "message":"캘린더_이달의 뽑기 기록이 없습니다." },
    FOLDER_MONTHLYADVENTURETIME_ERROR : { "isSuccess": false, "code": 3032, "message":"캘린더_이달의 모험 날짜 조회 오류." },
    FOLDER_RANDOMRESULTCOUNT_ERROR  : { "isSuccess": false, "code": 3033, "message": "캘린더_뽑기 개수 조회 오류." },

    //RECORDING_RANDOMRESULTLIST_NOT_EXIST : { "isSuccess": false, "code": 3034, "message":"이날의 뽑기 기록이 없습니다." },
    FOLDER_EDIT_WRONG_CHOICE : { "isSuccess": false, "code": 3034, "message":"폴더 수정_현 폴더에 있어 plus할 수 없거나, 현 폴더에 없어 minus 할 수 없습니다." },

    RECORDING_CONTENT_ERROR : { "isSuccess": false, "code": 3035, "message": "기록하자_기록 조회 오류" },

    RECORDING_FOLDERIDX_NOT_EXIST : { "isSuccess": false, "code": 3036, "message": "RECORDING 테이블에 해당 folderIdx 값이 존재하지 않습니다." },
    RECORDING_RANDOMRESULTIDX_NOT_EXIST : { "isSuccess": false, "code": 3037, "message": "RECORDING 테이블에 해당 randomResultIdx 값이 존재하지 않습니다." },

    RECORDING_FOLDER_CONTENT_NOT_EXIST : { "isSuccess": false, "code": 3038 , "message": "해당 폴더에 저장된 기록하자 내용이 없습니다." },
    RECORDING_EACH_CONTENT_NOT_EXIST : { "isSuccess": false, "code": 3039, "message": "해당 개별항목에 저장된 기록하자 내용이 없습니다." },

    RECORDING_FOLDER_RANDOMRESULT_NOT_EXIST : { "isSuccess": false, "code": 3040, "message": "해당 폴더 기록에 대해 저장된 뽑기 결과가 없습니다." },
    RECORDING_EACH_RANDOMRESULT_NOT_EXIST : { "isSuccess": false, "code": 3041, "message": "해당 개별항목에 대해 저장된 뽑기 결과가 없습니다." },

    RECORDING_FOLDERIDX_ALREADY_EXIST : { "isSuccess": false, "code": 3042, "message":"이미 해당 폴더에 대한 기록이 존재합니다." },
    RECORDING_RANDOMRESULTIDX_ALREADY_EXIST : { "isSuccess": false, "code": 3043, "message":"이미 해당 개별항목에 대한 기록이 존재합니다." },

    //관리하자 (3071 ~ )

    /** Connection, Transaction 등의 서버 오류 */
    DB_ERROR : { "isSuccess": false, "code": 4000, "message": "데이터 베이스 에러"},
    SERVER_ERROR : { "isSuccess": false, "code": 4001, "message": "서버 에러"},


}
