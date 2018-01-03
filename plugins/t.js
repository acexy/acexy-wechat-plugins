/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 百度翻译api
 */

const program = require('../lib/commandBulider');
const httpRequest = require('../lib/httpRequest');
const md5 = require('md5');

const apiUrl = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

program.version("1.0.0");
program.command("t <word>", "使用百度翻译引擎翻译指定内容 例如: t 你好", async function (word) {

    let urlParams = "?q=" + encodeURI(word);

    let salt = new Date().getTime();
    let appid = global.config.baiduTranslateApi.appid;

    urlParams += "&from=auto&to=auto";
    urlParams += "&appid=" + appid;
    urlParams += "&salt=" + salt;
    urlParams += "&sign=" + md5(appid + word + salt + global.config.baiduTranslateApi.secretKey);

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
    return await program.exec(reqData.req.splitContent);
};