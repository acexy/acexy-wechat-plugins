/**
 * @Author:acexy@thankjava.com
 * 17/12/26
 * @Description: 命令行定义及处理工具
 */
module.exports = Command;

const defaultVersion = '1.0.0';

function Command(args, desc, fn) {
    let self = this;
    if (!args) {
        this.commands = {
            command: {},
            version: defaultVersion
        };
    } else {
        let rawArgs = args;
        args = args || '';
        args = args.split(' ');
        if (args.length == 1) {
            throw new SyntaxError('命令语法错误: 至少需要一个命令和一个参数');
        }
        let command = String(args[0]);
        let program = String(args[1]);

        let requiredArgs = [];
        let optionArgs = [];
        if (program.indexOf('<') != -1 || program.indexOf('[') != -1) {
            // 没有子命令
            this.command = command;
            args.shift();

            for (let index in args) {
                if (/^<(\w)+>$/.test(args[index])) {
                    requiredArgs.push(args[index].substring(1, args[index].length - 1));
                } else if (/^\[(\w)+\]$/.test(args[index])) {
                    optionArgs.push(args[index].substring(1, args[index].length - 1))
                } else {
                    throw new SyntaxError('命令语法错误: 指定的参数没有正常的使用[]或<>');
                }
            }
            this.args = args;
            this.rawArgs = rawArgs;
            self.cmd = command;
        } else {
            let param = args[2];
            this.command = command + ' ' + program;
            if (param) {
                if (param.indexOf('<') == -1 && param.indexOf('[') == -1) {
                    throw new SyntaxError('命令语法错误: 子命令后只能是参数');
                }
                this.command = command + ' ' + program;
            }

            args.shift();
            args.shift();

            for (let index in args) {
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
        this.rawArgs = rawArgs;
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
    let cmd = new Command(args, desc, fn);
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
Command.prototype.exec = async function (args, openId) {
    let self = this;
    if (Array.isArray(args)) {
        let command = String(args[0]);
        if (args.length == 1) {
            let cmd = self.commands.command[command];
            return "命令: " + command + " 至少需要" + cmd.requiredArgs[0] + "个必要参数🤗 ，可使用 " + command + " -help 以获取帮助信息 🧐";
        } else if (args.length == 2) {
            let program = String(args[1]);
            let cmd = self.commands.command[command];
            if (!cmd) {
                if (program == '-help' || program == '--help') {
                    return helpBuilder(self, cmd);
                }
                // 没有根命令只有子命令
                cmd = self.commands.command[command + ' ' + program];
                if (!cmd) {
                    return "无效的子命令: " + program + " 😢，可使用 " + command + " -help 以获取帮助信息 🧐";
                } else if (cmd.requiredArgs.length != 0) {
                    return "命令: " + command + ' ' + program + " 至少需要" + cmd.requiredArgs.length + "个必要参数🤗 ，可使用 " + command + " -help 以获取帮助信息 🧐";
                }
            }

            if (program == '-help' || program == '--help') {
                return helpBuilder(self, cmd);
            }

            if (cmd.requiredArgs.length == 0) {
                args.shift();
            }
            args.shift();
            args.push(openId);
            return await cmd.fn.apply(self, args);
        } else {
            let program = String(args[1]);
            // 执行一个含有子命令的命令
            let cmd = self.commands.command[command + ' ' + program];
            if (!cmd) {
                return "无效的子命令: " + program + ' 😢，可使用 " + command + " -help 以获取帮助信息 🧐';
            }
            if (args[2] == '-help' || args[2] == '--help') {
                return helpBuilder(self, cmd);
            }
            args.shift();
            args.shift();
            let argsLength = args.length;
            let totalRequiredArgs = cmd.requiredArgs.length;
            if (argsLength < totalRequiredArgs) {
                return "命令: " + command + ' ' + program + " 至少需要" + totalRequiredArgs + "个必要参数🤗 ，可使用 " + command + " -help 以获取帮助信息 🧐";
            }
            args.push(openId);
            return await cmd.fn.apply(self, args);
        }
    } else {
        return '错误的执行命令参数: 执行参数必须是数组';
    }
};

function helpBuilder(self, cmd) {
    let help = '版本: ' + self.commands.version + '\n';
    if (!cmd || cmd.command.indexOf(' ') == -1) {
        help += '命令:\n\n';
        // 根命令
        let commands = self.commands.command;
        for (let command in commands) {
            cmd = self.commands.command[command];
            help += cmd.rawArgs;
            help += '\n\t' + cmd.desc + '\n\n';
        }
    } else {
        // 子命令
        help += '命令:\n\n' + cmd.rawArgs;
        help += '\n\t' + cmd.desc;

    }
    return help;
}