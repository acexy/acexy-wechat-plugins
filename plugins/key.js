/**
 * @Author:acexy@thankjava.com
 * 18/1/8
 * @Description:
 */
const commandBuilder = require('../lib/commandBuilder');
const mysqlPool = require('../lib/mysqlDriver');
const program = new commandBuilder();

const SQL = global.config.sql;

program.command("key set <key> <value>", "创建/更新关键字检索信息 例如: key set jquery jQuery是一个快速、简洁的JavaScript框架", async function (key, value, openId) {
    var response = await mysqlPool.exec(SQL.keyCount, [key, openId]);
    if (response.flag) {
        if (response.data[0].count == 0) {
            // 历史未创建
            response = await mysqlPool.exec(SQL.keyInsert, [openId, key, value]);
            if (response.flag) {
                return "关键字 " + key + " 创建完成, 可通过 key find " + key + " 查询";
            }
        } else {
            // 历史已经创建
            response = await mysqlPool.exec(SQL.keyUpdate, [value, key, openId]);
            if (response.flag) {
                return "关键字 " + key + " 更新完成, 可通过 key find " + key + " 查询";
            }
        }
    }
    return "关键字 " + key + " 处理失败";
});

/**
 * 模糊查询自己创建的关键字信息
 */
program.command("key find <key>", "模糊查询自己创建的关键字Key信息 例如: key find jquery", async function (key, openId) {
    var response = await mysqlPool.exec(SQL.keyFindKey, [openId, key]);
    if (response.flag) {
        var list = response.data;
        if (!list || list.length == 0) {
            return "关键字 " + key + " 未能检索到任何内容";
        }
        var content = '';
        for (var index in list) {
            content += (Number(index) + 1) + "、[" + list[index].keyword + "] : " + list[index].information + "\n";
        }
        return content;
    }
    return "查询内容失败"
});

program.command("key findv <value>", "模糊查询自己创建的关键字Value信息 例如: key findv 框架", async function (value, openId) {
    var response = await mysqlPool.exec(SQL.keyFindValue, [openId, value]);
    if (response.flag) {
        var list = response.data;
        if (!list || list.length == 0) {
            return "关键字 " + value + " 未能检索到任何内容";
        }
        var content = '';
        for (var index in list) {
            content += (Number(index) + 1) + "、[" + list[index].keyword + "] : " + list[index].information + "\n";
        }
        return content;
    }
    return "查询内容失败"
});

program.command("key del <key>", "删除自己创建的关键字信息 例如: key del jquery", async function (key, openId) {
    var response = await mysqlPool.exec(SQL.keyCount, [key, openId]);
    if (response.flag) {
        if (response.data[0].count == 0) {
            return "你并未创建 " + key + " 关键字信息哦";
        } else {
            response = await await mysqlPool.exec(SQL.keyDel, [openId, key]);
            if (response.flag) {
                return "关键字 " + key + " 删除成功";
            }
        }
    }
    return "删除关键字信息失败"
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};