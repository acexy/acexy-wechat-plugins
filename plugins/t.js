/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 百度翻译api
 */

const program = require('../commandBulider');

program.version("1.0.1");
program.command("t <word>", "翻译模块", async function (word) {
    return word;
});

module.exports.exec = async reqData => {
    return await program.exec(reqData.req.splitContent);
};