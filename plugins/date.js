/**
 * @Author:acexy@@acexy.cn
 * 18/1/4
 * @Description: 时间相关的处理模块
 */
const commandBuilder = require('../../utils/basic/commandBuilder');
const program = new commandBuilder();

/**
 * 将普通时间转化为时间戳
 */
program.command("date ct2ut <time>", "将输入的时间(yyyy/MM/dd HH:mm:ss.SSS)转换为时间戳 例如: date ct2ut \"2018/01/01\"", async function (time) {
    let date = new Date(time);
    let timestamp = date.getTime();
    if (isNaN(timestamp)) {
        return time + " 不是有效的时间格式";
    }
    return timestamp;
});

program.command("date ut2ct <timestamp>", "将时间戳转换为普通时间(yyyy/MM/dd HH:mm:ss) 例如: date ut2ct 1484150400000", async function (timestamp) {
    let time = Number(timestamp);
    if (isNaN(time)) {
        return timestamp + " 不是有效的时间戳";
    }
    if (timestamp.length == 10) {
        time *= 1000;
    } else if (timestamp.length != 13) {
        return timestamp + " 不是有效的时间戳";
    }
    return new Date(time).format('yyyy-MM-dd HH:mm:ss');
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};
