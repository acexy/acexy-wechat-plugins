/**
 * @Author:acexy@acexy.cn
 * 17/12/26
 * @Description: freedom
 */

const commandBuilder = require('../../utils/basic/commandBuilder');
const program = new commandBuilder();

program.version("1.0.0");
program.command("f pp <p1> <p2>", "计算价格振幅 <当前价格> <目标价格>例如: f pp 0.1 0.2", async function (p1, p2) {
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

program.command("f ppm <p1> <p2> <m>", "计算到达目标价格的价值变化 <当前价格> <目标价格> <初始价值> 例如: f ppm 1.2 1.3 50", async function (p1, p2, m) {
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
program.command("f pmm <p> <m1> <m2>", "计算达到目标价值需要的价格变动 <当前价格> <当前价值> <目标价值> 例如: f pmm 1.2 40 50", async function (p, m1, m2) {
    const price = Number(p)
    const curValue = Number(m1)
    const tgtValue = Number(m2)

    // 参数校验
    if (![price, curValue, tgtValue].every(Number.isFinite)) {
        throw new Error('错误: 参数必须是数字')
    }
    if (price === 0) {
        throw new Error('错误: 当前价格不能为 0')
    }
    if (curValue === 0) {
        throw new Error('错误: 当前价值不能为 0')
    }

    // 持仓数量
    const amount = curValue / price

    // 目标价格
    const targetPrice = tgtValue / amount

    // 涨跌百分比
    const percentChange = ((targetPrice - price) / price) * 100

    const formattedTarget = targetPrice.toFixed(4)
    const formattedPercent = percentChange.toFixed(4)

    const lines = []
    lines.push(`目标价格: ${formattedTarget}`)
    lines.push(`需要涨跌百分比: ${formattedPercent}%`)

    return lines.join('\n')
});

program.command("f pz <p> <z>", "计算按照涨跌幅得到的新价格: <当前价格> <涨跌幅百分比x%> 例如: f pz 1.2 -5", async function (p, z) {
    if (p === undefined || z === undefined) {
        throw new Error('计算按照涨跌幅得到的新价格: <当前价格> <涨跌幅百分比x%>')
    }

    const price = Number(p)
    if (!Number.isFinite(price)) {
        throw new Error('错误: 当前价格必须是数字')
    }

    // 去掉百分号
    const percentClean = String(z).replace('%', '')
    const pct = Number(percentClean)

    if (!Number.isFinite(pct)) {
        throw new Error('错误: 涨跌幅必须是数字')
    }

    const newPrice = price * (1 + pct / 100)

    // 保留最多 8 位小数，去掉无意义的 0
    let formattedPrice = newPrice.toFixed(8)
    formattedPrice = formattedPrice.replace(/0+$/, '').replace(/\.$/, '')

    return [
        `当前价格: ${price}`,
        `涨跌幅: ${pct}%`,
        `新价格: ${formattedPrice}`
    ].join('\n')
});

program.command("f np <am> <p1> <p2> <p3>", "计算持仓均价调整到目标均价的加仓情况: <持有数量> <持有均价> <加仓价格> <目标均价> 例如: f pz 1.2 -5", async function (am, p1, p2, p3) {
    const a = Number(am)
    const curAvg = Number(p1)
    const price = Number(p2)
    const tgtAvg = Number(p3)

    // 参数校验
    for (const [name, val] of [
        ['持有数量', a],
        ['持有均价', curAvg],
        ['加仓价格', price],
        ['目标均价', tgtAvg]
    ]) {
        if (!Number.isFinite(val)) {
            throw new Error(`错误: ${name} 必须是数字`)
        }
    }

    // 最新价格不能等于目标均价
    if (price === tgtAvg) {
        throw new Error('无法计算：最新价格不能等于目标均价')
    }

    // 当前总成本
    const currentTotal = a * curAvg

    /**
     * 推导公式：
     * (当前总成本 + x * 最新价格) / (当前数量 + x) = 目标均价
     *
     * x = (目标均价 * 当前数量 - 当前总成本) / (最新价格 - 目标均价)
     */
    const numerator = tgtAvg * a - currentTotal
    const denominator = price - tgtAvg
    const neededAmount = numerator / denominator

    // 如果 <= 0，说明已经满足目标均价
    if (neededAmount <= 0) {
        return '无需加仓，当前均价已满足目标均价'
    }

    // 需要投入的资金
    const neededCost = neededAmount * price

    const formattedAmount = neededAmount.toFixed(4)
    const formattedCost = neededCost.toFixed(4)

    return [
        `为达目标均价: ${tgtAvg}`,
        `需以加仓价格: ${price}`,
        `新增数量: ${formattedAmount}`,
        `新增金额: ${formattedCost}`
    ].join('\n')
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};

