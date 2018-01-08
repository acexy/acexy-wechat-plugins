/**
 * @Author:acexy@thankjava.com
 * 18/1/8
 * @Description:
 */
const mysqlPool = require('../../utils/lib/mysqlDriver');
module.exports.exec = mysqlPool.execSQL;
module.exports.escape = mysqlPool.escape;