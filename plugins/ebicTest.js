/**
 * @Author:acexy@thankjava.com
 *
 * @Description: 电银的一些辅助命令 测试环境
 */

const CommandBuilder = require('../lib/commandBuilder');
const program = new CommandBuilder();
const fs = require('fs');
const WXPaySDK = require('../../utils/lib/wxsdk');

const xmlJson = require('../../utils/lib/xmlJson');


const cmdEbic = global.config.cmdEbic;

program.version("1.0.2");

program.command("ebicTest bindSubAppid <subMchId> <subAppId>", '为子商户号绑定subAppId (使用mchId=1900008721) \n 例如: ebicTest bindSubAppid 3333333 wxwxwxwxx', async function (subMchId, subAppId) {
    return await bindSubAppid(subMchId, subAppId, 'test');
});

program.command("ebicTest addPayUrl <subMchId> <payUrl>", '为子商户号添加支付目录 (使用mchId=1900008721) \n 例如: ebicTest addPayUrl 3333333 https://pay.com/', async function (subMchId, payUrl) {
    return await addPayUrl(subMchId, payUrl, 'test');
});

program.command("ebicTest bindSubAppidNew <subMchId> <subAppId>", '为子商户号绑定subAppId (使用mchId=1900009211) \n 例如: ebicTest bindSubAppidNew 3333333 wxwxwxwxx', async function (subMchId, subAppId) {
    return await bindSubAppid(subMchId, subAppId, 'testnew');
});

program.command("ebicTest addPayUrlNew <subMchId> <payUrl>", '为子商户号添加支付目录 (使用mchId=1900009211) \n 例如: ebicTest addPayUrlNew 3333333 https://pay.com/', async function (subMchId, payUrl) {
    return await addPayUrl(subMchId, payUrl, 'testnew');
});

const bindSubAppid = async (subMchId, subAppId, env) => {
    let config = cmdEbic[env];
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
}

const addPayUrl = async (subMchId, payUrl, env) => {
    let config = cmdEbic[env];
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
}
const doRequest = async (wxpay, reqData) => {
    let response = await wxpay.requestWithCert(WXPaySDK.WXPayConstants.DOMAIN + '/secapi/mch/addsubdevconfig', reqData);
    response = await xmlJson.xml2Json(response);
    if (response.xml.return_code === 'SUCCESS' && response.xml.result_code === 'SUCCESS') {
        return '操作成功';
    } else {
        return '操作失败: ' + (!response.xml.err_code_des ? response.xml.return_msg : response.xml.err_code_des);

    }
}

module.exports.exec = async reqData => {
    return await program.exec(reqData.request.args);
};

