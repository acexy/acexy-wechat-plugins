/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 百度翻译api
 */

const program = require('../lib/commandBulider');
const http = require('../lib/httpRequest');
const md5 = require('md5');

const apiUrl = 'http://api.fanyi.baidu.com/api/trans/vip/translate';

program.version("1.0.1");
program.command("t <word>", "使用百度翻译引擎翻译用户指定的内容为英文。 word: 需要翻译的内容", async function (word) {

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

    return http.doRequest(requestParam);
});

module.exports.exec = async reqData => {
    var response = await program.exec(reqData.req.splitContent);
    if (response.flag) {
        return JSON.parse(response.body).trans_result[0].dst;
    }
    return "翻译失败";
};