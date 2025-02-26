/**
 * @Author:acexy@acexy.cn
 * 20/12/19
 * @Description:
 */
const commandBuilder = require('../../utils/basic/commandBuilder');
const mysqlPool = require('../lib/mysqlDriver');
const program = new commandBuilder();
const totp = require('totp-generator');

const SQL = global.config.sql;

/**
 * 模糊查询自己创建的关键字信息
 */
program.command("gcode set <secretCode> <remark>", "设置新的GoogleCode令牌", async function (secretCode, remark, openId) {
    let response = await mysqlPool.exec(SQL.gcodeMaxSecretNo, [openId]);
    if (!response.flag) {
        return "处理失败请重试";
    }
    let maxNo
    if (!response.data[0].max_no) {
        maxNo = 1;
    } else {
        maxNo = response.data[0].max_no + 1;
    }
    if (remark.length > 30) {
        return "备注信息过长";
    }

    response = await mysqlPool.exec(SQL.gcodeSetSecretConfig, [openId, maxNo, secretCode, remark]);
    if (response.flag) {
        return '成功设置令牌 可通过 gcode get ' + maxNo + ' 获取令牌验证码 \n\n请注意删除上一条设置时发送的信息，以便保护你的secretCode！';
    }
    return "处理失败请重试";

});

program.command("gcode list", "获取已设置的GoogleCode配置清单", async function (openId) {
    let response = await mysqlPool.exec(SQL.gcodeFindConfig, [openId]);
    if (response.flag) {
        let list = response.data;
        if (!list || list.length === 0) {
            return "暂未配置任何Google验证码令牌, 可通过 gcode set 命令设置";
        }
        let content = '';
        for (let index in list) {
            content += list[index].secret_no + ": " + list[index].remark + "\n";
        }
        content += '\n使用 gcode get <令牌编号> 获取验证码';
        return content;
    } else {
        return '查询配置失败';
    }
});

/**
 * 模糊查询自己创建的关键字信息
 */
program.command("gcode get <secretNo>", "获取Google算法产生的验证码", async function (secretNo, openId) {
    let response = await mysqlPool.exec(SQL.gcodeFindSecretCode, [openId, secretNo]);
    if (!response.flag) {
        return "处理失败请重试";
    }
    if (!response.data[0] || !response.data[0].secret_code) {
        return '无效的令牌编号 \n可通过 gcode list 查询已配置Google令牌'
    }
    return totp(response.data[0].secret_code);
});


module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args, reqData.openid);
};
