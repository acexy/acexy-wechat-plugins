/**
 * @Author:acexy@thankjava.com
 * 2017/12/25
 * @Description:
 */
const request = require('request');

/**
 * 请求http的封装工具
 * 返回对象
 * { flag: - boolean 是否成功
 *   body: - 返回数据}
 * @param requestParam
 * @returns {Promise<any>}
 */
module.exports.doRequest = requestParam => new Promise(resolve => {
    var startTime = new Date().getTime();
    request(requestParam, (err, response, body) => {
        let data = {flag: false};
        if (err) {
            resolve(data);
        } else {
            data.flag = true;
            data.body = body;
            console.log(body)
            resolve(data);
        }
    });
});