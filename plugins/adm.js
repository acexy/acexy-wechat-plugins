/**
 * @Author:acexy@thankjava.com
 * 18/1/8
 * @Description:
 */
const commandBuilder = require('../lib/commandBuilder');
const mysqlPool = require('../lib/mysqlDriver');
const program = new commandBuilder();
const totp = require('totp-generator');

const SQL = global.config.sql;
const googleAuthCode = global.config.googleAuthCode;

program.command("adm addPubCmd <cmd>", "增加一个公开命令权限 例如: adm addPubCmd key", async function (cmd) {
    let response = await mysqlPool.exec(SQL.addPubCmd, [cmd]);
    if (response.flag) {
        return "已成功设置公开权限命令 " + cmd;
    }
    return "命令设置失败 " + cmd;
});

/**
 * 模糊查询自己创建的关键字信息
 */
program.command("adm addPriCmd <cmd> <openId> <remark>", "为openId设置命令访问权限 例如: adm addPriCmd key xxxxxxx 测试", async function (cmd, openId, remark) {
    let response = await mysqlPool.exec(SQL.addPriCmd, [cmd, openId, remark]);
    if (response.flag) {
        return "已成功设置权限命令 " + cmd;
    }
    return "命令设置失败 " + cmd;
});

/**
 * 模糊查询自己创建的关键字信息
 */
program.command("adm gcode <tokenId>", "获取Google算法产生的验证码", async function (tokenId) {
    let auth = googleAuthCode[tokenId];
    if (!auth) {
        return "无效的tokenId";
    }
    return totp(auth.token);
});


module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};