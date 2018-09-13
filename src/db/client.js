const mysql = require('mysql');
const isChinese = require('is-chinese');
const mysqlConfig = require('../../config-mysql.json');

const createNewConnection = () => mysql.createConnection(mysqlConfig);

const _executeQuery = (sql, params) => {
    return new Promise((resolve, reject) => {
        const connection = createNewConnection();
        connection.connect();
        try {
            if (mysqlConfig.logsql) {
                const formatSql = mysql.format(sql, params);
                console.log('---execute sql---', formatSql);
            }
            connection.query({ sql, timeout: mysqlConfig.connectTimeout}, params, (error, results, fields) => {
                if (error) {
                    console.error('exec sql error: ', error);
                    reject(error);
                };
                resolve(results);
            });
        } catch (error) {
            console.error('exec sql query error: ', error);
            reject(error);
        } finally {
            connection.end();
        }
    });
}

const deleteCaptchas = async captchas => {
    const sql = 'DELETE FROM captchaSuccess WHERE id IN (?) ;';
    const params = captchas.map(item => item.id);
    return _executeQuery(sql, [params]);
}

const deleteCharacters = async captchas => {
    const sql = 'DELETE FROM characters WHERE captchaSuccessId IN (?) ;';
    const params = captchas.map(item => item.id);
    return _executeQuery(sql, [params]);
}

const insertCaptchas = async captchas => {
    const sql = 'INSERT INTO captchaSuccess VALUES ? ;';
    const params = captchas.map(item => [item.id, item.key, item.color, item.result, item.decodeMethod, item.captcha, item.lastModifiedTime]);
    // const params = captchas.map(item => [item.id, item.key, item.color, item.result, item.decodeMethod, '', item.lastModifiedTime]);
    return _executeQuery(sql, [params]);
}

const insertCharacters = async captchas => {
    const sql = 'INSERT INTO characters VALUES ? ;';
    let charactersMap = [];
    captchas.forEach(item => {
        item.result.split('').forEach((character, index) => {
            charactersMap.push({
                captchaSuccessId: item.id,
                characterValue: character,
                isChinese: isChinese(character) ? 1 : 0,
                result: item.result,
                indexOfResult: index
            })
        })
    });
    const params = charactersMap.map(item => [item.captchaSuccessId, item.characterValue, item.isChinese, item.result, item.indexOfResult]);
    return _executeQuery(sql, [params]);
}

const saveCaptchas = async captchas => {

    if (!captchas || captchas.length === 0){
        return 0;
    }

    const deleteCaptchasResult = await deleteCaptchas(captchas);
    console.log(`delete ${deleteCaptchasResult.affectedRows} rows in captchaSuccess`);

    const deleteCharactersResult = await deleteCharacters(captchas);
    console.log(`delete ${deleteCharactersResult.affectedRows} rows in characters`);

    const insertCaptchaResult = await insertCaptchas(captchas);
    console.log(`insert ${insertCaptchaResult.affectedRows} rows in captchaSuccess`);    
 
    const insertCharactersResult = await insertCharacters(captchas);
    console.log(`insert ${insertCharactersResult.affectedRows} rows in characters`);

    return insertCaptchaResult.affectedRows;
}

const searchCaptchas = query => {
    const sql = `SELECT * FROM captchaSuccess WHERE color LIKE ? AND decodeMethod LIKE ? AND result LIKE ? AND lastModifiedTime BETWEEN ? AND ? LIMIT ? ;`;
    const params = [`%${query.color}%`, `%${query.method}%`, `%${query.result}%`, query.startTime, query.endTime, parseInt(query.max)]
    return _executeQuery(sql, params);
}

const getLastSycnTime = () => {
    const sql = `SELECT * FROM captchaSuccess ORDER BY lastModifiedTime DESC LIMIT 1; `;
    return _executeQuery(sql, []);
}

module.exports = {
    saveCaptchas,
    searchCaptchas,
    getLastSycnTime
}
