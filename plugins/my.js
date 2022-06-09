/**
 * 处理个人化的一些命令
 * @type {Command}
 */
const commandBuilder = require('../../utils/basic/commandBuilder');
const program = new commandBuilder();

program.command("my openId", "获取你的openId", async function (openId) {
    return openId;
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};