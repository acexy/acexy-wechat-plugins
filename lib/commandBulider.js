/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 命令行定义及处理工具
 */

exports = module.exports = new Command();

exports.Command = Command;

var defaultVersion = '1.0.0';

function Command(args, desc, fn) {
    if (!args) {
        this.commands = {
            command: {},
            version: defaultVersion
        };
    } else {
        args = args || '';
        args = args.split(' ');
        if (args.length == 1) {
            throw new SyntaxError('命令语法错误: 至少需要一个命令和一个参数');
        }
        var command = String(args[0]);
        var program = String(args[1]);

        var requiredArgs = [];
        var optionArgs = [];
        if (program.indexOf('<') != -1 || program.indexOf('[') != -1) {
            // 没有子命令
            this.command = command;
            args.shift();

            for (var index in args) {
                if (/^<(\w)+>$/.test(args[index])) {
                    requiredArgs.push(args[index].substring(1, args[index].length - 1));
                } else if (/^\[(\w)+\]$/.test(args[index])) {
                    optionArgs.push(args[index].substring(1, args[index].length - 1))
                } else {
                    throw new SyntaxError('命令语法错误: 指定的参数没有正常的使用[]或<>');
                }
            }
            this.args = args;
        } else {
            var param = args[2];
            if (param) {
                if (param.indexOf('<') == -1 && param.indexOf('[') == -1) {
                    throw new SyntaxError('命令语法错误: 子命令后只能是参数');
                }
                this.command = command + ' ' + program;
            }

            args.shift();
            args.shift();

            for (var index in args) {
                if (/^<(\w)+>$/.test(args[index])) {
                    requiredArgs.push(args[index].substr(1, args[index].length - 1));
                } else if (/^\[(\w)+\]$/.test(args[index])) {
                    optionArgs.push(args[index].substring(1, args[index].length - 1))
                } else {
                    throw new SyntaxError('命令语法错误: 指定的参数没有正常的使用[]或<>');
                }
            }
            this.args = args;
        }
        this.fn = fn;
        this.desc = desc;
        this.requiredArgs = requiredArgs;
        this.optionArgs = optionArgs;
    }
}

/**
 * 解析定义的命令
 * @param args
 * @param desc
 * @param fn
 */
Command.prototype.command = function (args, desc, fn) {
    var cmd = new Command(args, desc, fn);
    this.commands.command[cmd.command] = cmd;
};

/**
 * 版本号设置
 * @param version
 */
Command.prototype.version = function (version) {
    this.commands.version = version || defaultVersion;
};

/**
 * 执行器
 * @param args
 * @returns {*}
 */
Command.prototype.exec = async function (args) {
    var self = this;
    if (Array.isArray(args)) {
        var command = String(args[0]);
        if (args.length == 1) {
            var cmd = self.commands.command[command];
            return "执行" + command + "命令失败: 至少需要一个必要参数: <" + cmd.requiredArgs[0] + ">";
        } else if (args.length == 2) {
            var cmd = self.commands.command[command];
            if (args[1] == '-help') {
                // TODO: 显示全量help
                return cmd.desc;
            }
            args.shift();
            return await cmd.fn.apply(self, args);
        } else {
            var program = String(args[1]);
            // 执行一个含有子命令的命令
            var cmd = self.commands.command[command + '' + program];
            if (!cmd) {
                return "命令" + command + "下的子命令: " + program + " 不存在";
            }
            args.shift();
            args.shift();
            var argsLength = args.length;
            var totalRequiredArgs = cmd.requiredArgs.length;
            if (argsLength < totalRequiredArgs) {
                return "命令" + command + "下的子命令: " + program + " 至少需要" + totalRequiredArgs + "个必要参数";
            }
            if (args[0] == '-help') {
                return cmd.desc;
            }
            return await cmd.fn.apply(self, args);
        }
    } else {
        return '错误的执行命令参数: 执行参数必须是数组';
    }
};

function helpBuilder(cmd) {

}