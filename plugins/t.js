/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 百度翻译api
 */

const commandBuilder = require('../lib/commandBuilder');
const program = new commandBuilder();

const httpRequest = require('../lib/httpRequest');
const md5 = require('md5');

const apiUrl = global.config.httpApiUrl.baiduTranslateApi;
const appId = global.config.baiduTranslateApi.appid;
const secretKey = global.config.baiduTranslateApi.secretKey;

program.version("1.0.0");
program.command("t <word>", "使用百度翻译引擎翻译指定内容 例如: t 你好", async function (word) {

    let urlParams = "?q=" + encodeURI(word);
    let salt = new Date().getTime();

    urlParams += "&from=auto&to=auto";
    urlParams += "&appid=" + appId;
    urlParams += "&salt=" + salt;
    urlParams += "&sign=" + md5(appId + word + salt + secretKey);

    let requestParam = {
        uri: apiUrl + urlParams,
        method: "get",
        timeout: 5000
    };

    var response = await httpRequest.doRequest(requestParam);
    if (response.flag) {
        return JSON.parse(response.body).trans_result[0].dst;
    } else {
        return "请求百度翻译失败了🥣";
    }
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};