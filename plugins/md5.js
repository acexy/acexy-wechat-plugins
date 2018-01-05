/**
 * @Author:acexy@thankjava.com
 * 2018/1/5
 * @Description:
 */
const httpRequest = require('../lib/httpRequest');
const commandBuilder = require('../lib/commandBuilder');
const program = new commandBuilder();

const md5 = require('md5');

program.command("md5 <content>", "将输入的数据进行md5加密 例如: md5 12345678", async function (content) {
    return md5(content);
});

program.command("md5 de <cipher>", "进行md5密文匹配反查原文 例如: md5 de e10adc3949ba59abbe56e057f20f883e", async function (cipher) {
    let requestParam = {
        uri: global.config.httpApiUrl.md5DecodeApi + cipher,
        method: "get",
        timeout: 5000
    };
    var response = await httpRequest.doRequest(requestParam);
    if (response.flag) {
        response = JSON.parse(response.body);
        if (response.flag == 1) {
            return response.plain;
        } else {
            return "未能匹配到相关原文";
        }
    }
    return "解密匹配失败";
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};