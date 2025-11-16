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
    let S = s.toUpperCase()
    let response = await mysqlPool.exec(SQL.txDetail, [S, S, S, S, S, S]);
    if (response.flag) {
        if (response.data && response.data.length > 0) {
            let resp = '';
            for (let k in response.fields) {
                resp += response.fields[k].name + ": " + response.data[0][response.fields[k].name] + '\n';
            }
            return resp;
        }
        return "暂无记录";
    }
    return "查询异常";
});

// 添加交易记录
program.command("tx l <s>", "交易记录列表 例如: tx l b", async function (s) {
    let S = s.toUpperCase()
    let response = await mysqlPool.exec(SQL.txList, [S, S, S]);
    if (response.flag) {
        if (response.data && response.data.length > 0) {
            let resp = '创建时间    方向  价值  数量  均价\n';
            for (let i = 0; i < response.data.length; i++) {
                let row = response.data[i];
                let str = '';
                for (let k in response.fields) {
                    str += row[response.fields[k].name] + ',';
                }
                str = str.substring(0, str.length - 1)
                resp += str + '\n';
            }
            return resp;
        }
        return "暂无记录";
    }
    return "查询异常";
});

program.command("tx c <s>", "关闭交易 例如: tx c b", async function (s) {
    let S = s.toUpperCase()
    let response = await mysqlPool.exec(SQL.txClose, [S, S]);
    if (response.flag) {
        return "处理成功";
    }
    return "处理失败";
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};