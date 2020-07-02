/**
 * @Author:acexy@thankjava.com
 *
 * @Description: 电银的一些辅助命令 测试环境
 */

const commandBuilder = require('../lib/commandBuilder');
const program = new commandBuilder();
const fs = require('fs');
const WXPaySDK = require('../../utils/lib/wxsdk');

const xmlJson = require('../../utils/lib/xmlJson');

const cmdEbic = global.config.cmdEbic;

program.version("1.0.1");
program.command("ebicTest bindSubAppid <subMchId> <subAppId>", '为子商户号绑定subAppId \n 例如: ebicTest bindSubAppid 3333333 wxwxwxwxx', async function (subMchId, subAppId) {

    let config = cmdEbic['test'];
    if (!config) {
        return "指定的环境未有相应的配置";
    }

    let wxpay = new WXPaySDK.WXPay({
        appId: config.appId,
        mchId: config.mchId,
        certFileContent: fs.readFileSync(config.certFilePath)
    });

    let reqData = {
        appid: config.appId,
        mch_id: config.mchId,
        sub_mch_id: subMchId,
        sub_appid: subAppId,
    }

    reqData.sign = WXPaySDK.WXPayUtil.generateSignature(reqData, config.key, WXPaySDK.WXPayConstants.SIGN_TYPE_MD5);
    return await doRequest(wxpay, reqData);
});

program.command("ebicTest addPayUrl <env> <subMchId> <payUrl>", '为子商户号添加支付目录 \n 例如: ebicTest addPayUrl 3333333 https://pay.com/', async function (subMchId, payUrl) {

    let config = cmdEbic["test"];
    if (!config) {
        return "指定的环境未有相应的配置";
    }

    let wxpay = new WXPaySDK.WXPay({
        appId: config.appId,
        mchId: config.mchId,
        certFileContent: fs.readFileSync(config.certFilePath)
    });

    let reqData = {
        appid: config.appId,
        mch_id: config.mchId,
        sub_mch_id: subMchId,
        jsapi_path: payUrl,
    }

    reqData.sign = WXPaySDK.WXPayUtil.generateSignature(reqData, config.key, WXPaySDK.WXPayConstants.SIGN_TYPE_MD5);
    return await doRequest(wxpay, reqData);
});

const doRequest = async (wxpay, reqData) => {
    let response = await wxpay.requestWithCert(WXPaySDK.WXPayConstants.DOMAIN + '/secapi/mch/addsubdevconfig', reqData);
    response = await xmlJson.xml2Json(response);
    if (response.xml.return_code === 'SUCCESS' && response.xml.result_code === 'SUCCESS') {
        return '操作成功';
    } else {
        return '操作失败: ' + !response.xml.err_code_des ? response.xml.return_msg : response.xml.err_code_des;
    }
}

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};

