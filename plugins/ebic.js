/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 百度翻译api
 */

const commandBuilder = require('../lib/commandBuilder');
const program = new commandBuilder();


program.version("1.0.0");
program.command("ebic bindSubAppid <env> <subMchId> <subAppId>", '为子商户号绑定subAppId \n\t 例如: ebic bindSubAppid test 3333333 wxwxwxwxx' +
    ' \t 参数说明 \n env: 环境 当前可选 test 测试 prd-online 生产线上 prd-offline 生产线下', async function (env, subMchId, subAppid) {

});

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};

