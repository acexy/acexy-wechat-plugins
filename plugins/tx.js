/**
 * @Author:acexy@thankjava.com
 * 18/1/8
 * @Description:
 */
const commandBuilder = require('../../utils/basic/commandBuilder');
const mysqlPool = require('../lib/mysqlDriver');
const program = new commandBuilder();

const SQL = global.config.sql;

// 添加交易记录
program.command("tx i <fs> <ts> <fm> <tm> <v>", "添加交易记录 例如: tx i b e 1 2 100", async function (fs, ts, fm, tm, v) {
    let response = await mysqlPool.exec(SQL.txInsert, [fs.toUpperCase(), ts.toUpperCase(), fm, tm, v]);
    if (response.flag) {
        return "添加成功";
    }
    return "处理失败";
});

// 添加交易记录
program.command("tx d <s>", "交易详情统计 例如: tx d b", async function (s) {
    let response = await mysqlPool.exec(SQL.txDetail, [s.toUpperCase(), s.toUpperCase(), s.toUpperCase(), s.toUpperCase()]);
    if (response.flag) {
        if (response.data) {
            let resp = '';
            for (let k in response.fields) {
                resp += k + ": " + response.fields[k] + '\n';
            }
            return resp;
        }
        return "暂无记录";
    }
    return "查询异常";
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};