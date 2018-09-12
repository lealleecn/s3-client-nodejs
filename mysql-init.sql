set global max_allowed_packet=1000000000;

CREATE TABLE captchaSuccess
(
    id varchar(32),
    `key` varchar(22),
    color varchar(2),
    result varchar(10),
    decodeMethod varchar(20),
    captcha text,
    lastModifiedTime datetime
);

CREATE TABLE characters
(
    captchaSuccessId varchar(32),
    characterValue varchar(3),
    isChinese int,
    result varchar(10),
    indexOfResult int
    
);

