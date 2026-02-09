/**
 * @Author:acexy@acexy.cn
 * 17/12/26
 * @Description: freedom
 */

const commandBuilder = require('../../utils/basic/commandBuilder');
const program = new commandBuilder();

program.version("1.0.0");
program.command("f pp <p1> <p2>", "计算价格振幅 例如: f pp 0.1 0.2", async function (p1, p2) {
    const cur = Number(p1)
    const tgt = Number(p2)

    if (!Number.isFinite(cur) || !Number.isFinite(tgt)) {
        throw new Error('价格必须是合法数字')
    }
    if (cur === 0) {
        throw new Error('当前价格不能为 0')
    }
    const change = ((tgt - cur) / cur) * 100

    // 四舍五入到 4 位小数
    const rounded = change.toFixed(4)

    return `${rounded}%`
});

program.command("f ppm <p1> <p2> <m>", "计算到达目标价格的价值变化 例如: f ppm 1.2 1.3 50", async function (p1, p2, m) {
    const cur = Number(p1)
    const tgt = Number(p2)
    const amt = Number(m)

    if (![cur, tgt, amt].every(Number.isFinite)) {
        throw new Error('错误: 参数必须是数字')
    }
    if (cur === 0) {
        throw new Error('错误: 当前价格不能为 0')
    }

    // 涨跌幅
    const change = ((tgt - cur) / cur) * 100
    const changeRounded = change.toFixed(4)

    // 最终价值
    const finalValue = (amt / cur) * tgt
    const finalValueRounded = finalValue.toFixed(4)

    // 盈亏
    const profit = (finalValue - amt).toFixed(4)

    const lines = []

    if (change >= 0) {
        lines.push(`涨幅：${changeRounded}%`)
    } else {
        lines.push(`跌幅：${changeRounded}%`)
    }

    lines.push(`投入：${amt}`)
    lines.push(`总值：${finalValueRounded}`)
    lines.push(`盈亏：${profit}`)

    return lines.join('\n')
});


module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};

