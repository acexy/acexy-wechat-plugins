/**
 * @Author:acexy@thankjava.com
 * 2018/1/5
 * @Description:
 */
const COMMAND_BUILDER = require('../lib/commandBuilder');
const program = new COMMAND_BUILDER();

const md5 = require('md5');

program.command("md5 en <content>", "将输入的数据进行md5加密 例如: md5 en 12345678", async function (content) {
    return md5(content);
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};