/**
 * @Author:acexy@thankjava.com
 * 18/1/8
 * @Description:
 */
const commandBuilder = require('../lib/commandBuilder');
const mysqlPool = require('../lib/mysqlDriver');
const util = require('util');

const program = new commandBuilder();

const SQL = global.config.sql;

program.command("key set <key> <value>", "创建/更新关键字检索信息 例如: key set jquery jQuery是一个快速、简洁的JavaScript框架", async function (key, value, openId) {
    if (!key || !value) {
        return "参数key或者value无效";
    }
    var response = await mysqlPool.exec(SQL.keySetCount, [key, openId]);
    if (response.flag) {
        if (response.data[0].count == 0) {
            // 历史未创建
            response = await mysqlPool.exec(SQL.keySetInsert, [new Date(), openId, key, value]);
            if (response.flag) {
                return "关键字 " + key + " 创建完成, 可通过 key find " + key + " 查询";
            }
        } else {
            // 历史已经创建
        }
    }
    return "";
});
/**
 * 模糊查询自己创建的关键字信息
 */
program.command("key find <content>", "模糊查询自己创建的关键字信息 例如: key find 帐号", async function (content) {
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};