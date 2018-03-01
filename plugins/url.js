/**
 * url相关处理工具
 * @type {Command}
 */
const commandBuilder = require('../lib/commandBuilder');
const program = new commandBuilder();

program.command("url en <content>", "将输入的数据进行URLEncode 例如: url en \"你好Acexy开发者工具\"", async function (content) {
    return encodeURI(content);
});

program.command("url de <content>", "将输入的数据进行URLDecode 例如: url de %e4%bd%a0%e5%a5%bdAcexy%e5%bc%80%e5%8f%91%e8%80%85%e5%b7%a5%e5%85%b7", async function (content) {
    return decodeURI(content);
});
module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};