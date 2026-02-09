/**
 * @Author:acexy@acexy.cn
 * 18/1/8
 * @Description:
 */
const commandBuilder = require('../../utils/basic/commandBuilder');
const mysqlPool = require('../lib/mysqlDriver');
const program = new commandBuilder();
const SQL = global.config.sql;

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

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};