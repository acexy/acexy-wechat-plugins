/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 百度翻译api
 */

const commandBuilder = require('../lib/commandBuilder');
const program = new commandBuilder();

const httpRequest = require('../lib/httpRequest');
const googleTranslateTk = require('../lib/googleTranslateTk');

const md5 = require('md5');
const util = require('util');


const baiduApiUrl = global.config.httpApiUrl.baiduTranslateApi;
const googleApiUrl = global.config.httpApiUrl.googleTranslateApi;

const baiduAppId = global.config.baiduTranslateApi.appid;
const baiduSecretKey = global.config.baiduTranslateApi.secretKey;

program.version("1.0.0");
program.command("t <word>", "使用Google翻译引擎翻译指定内容 例如: t \"hello world\"", async function (word) {

    // 判断当前输入内容是中文或英文 sl: 翻译原内容语言类型 tl: 翻译后目标语言类型
    word = extend(word);

    let tl = 'zh-CN';
    let tk = googleTranslateTk.tk(word);

    let flag = isInputCN(word);
    if (flag) { // 含有中文需要urlencode
        word = encodeURI(word);
    }

    let uri = util.format(googleApiUrl, tl, tk, word);
    let requestParam = {
        uri: uri,
        method: "get",
        timeout: 5000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:59.0) Gecko/20100101 Firefox/59.0'
        }
    };

    let response = await httpRequest.doRequest(requestParam);

    if (response.flag) {
        let obj = JSON.parse(response.body);
        let target = obj[0][0][0];
        if (flag) {
            let sl = obj[2];
            if (sl == tl) { // 含有中文类型输入，最后语言分析得出输入为中文，则需要转为英文
                // 输入的是中文
                uri = util.format(googleApiUrl, "en", tk, word);
                requestParam = {
                    uri: uri,
                    method: "get",
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:59.0) Gecko/20100101 Firefox/59.0'
                    }
                };
                response = await httpRequest.doRequest(requestParam);
                if (response.flag) {
                    return JSON.parse(response.body)[0][0][0];
                } else {
                    return "请求Google翻译失败了🥣";
                }
            }
        }
        return target;
    } else {
        return "请求Google翻译失败了🥣";
    }
});

program.command("t b <word>", "使用百度翻译引擎翻译指定内容 例如: t b \"hello world\"", async function (word) {

    word = extend(word);
    let urlParams = "?from=auto&to=auto";
    let salt = new Date().getTime();

    urlParams += "&appid=" + baiduAppId;
    urlParams += "&salt=" + salt;
    urlParams += "&sign=" + md5(baiduAppId + word + salt + baiduSecretKey);
    urlParams += "&q=" + encodeURI(word);

    let requestParam = {
        uri: baiduApiUrl + urlParams,
        method: "get",
        timeout: 5000
    };

    let response = await httpRequest.doRequest(requestParam);
    if (response.flag) {
        return JSON.parse(response.body).trans_result[0].dst;
    } else {
        return "请求百度翻译失败了🥣";
    }
});

// 判断输入内容是否是中文
const isInputCN = (word) => {
    let len = word.length;
    let countCN = 0;
    for (var index = 0; index < len; index++) {
        if (word[index].charCodeAt(0) > 256) {
            countCN++;
        }
    }
    if (countCN > 0) {
        return true
    }
    return false;
};

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};

const extend = (word) => {
    word = word.replace("&", " ");
    return word;
};

