const log4js = require('log4js');
const logger_pattern = "[%d{hh:mm:ss.SSS}] %3.3c:[%5.5p] %m";
const logger_pattern_console = "[%d{yy/MM/dd hh:mm:ss}] %[%3.3c:[%5.5p]%] %m";
log4js.configure({
    appenders: {
        "console": {
            type: "console",
            layout: {
                type: "pattern",
                pattern: logger_pattern_console
            },
        },
        "dateLog": {
            type: "dateFile",
            filename: "logs/day",
            pattern: "yy-MM-dd.log",
            alwaysIncludePattern: true,
            layout: {
                type: "pattern",
                pattern: logger_pattern
            },
        },
        "dataEntryLog": {
            type: "dateFile",
            filename: "logs/dataLog",
            pattern: "yy-MM-dd.csv",
            alwaysIncludePattern: true,
            layout: {
                type: "pattern",
                pattern: "%-17.17X{nodeName},%m,%9.9X{usedTraffic}MB, %X{increment}",
            },
        },
        "debug_to_con": {
            type: "logLevelFilter",
            appender: "console",
            level: "debug",
        }
    },
    categories: {
        "default": {appenders: ["dateLog"], level: "debug"},
        "con": {appenders: ["console"], level: "debug"},
        "dataEntry": {appenders: ["dataEntryLog"], level: "debug"},
        "cy": {appenders: ["dateLog","console"], level: "debug"},
    }
})
// module.exports=log4js.getLogger;
module.exports = (param) => {
    return {
        conLogger: log4js.getLogger("con"),
        cyLogger: log4js.getLogger("cy"),
        dataEntryLogger: log4js.getLogger("dataEntry"),
    }
};