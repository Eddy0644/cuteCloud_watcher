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
        "debug_to_con": {
            type: "logLevelFilter",
            appender: "console",
            level: "debug",
        }
    },
    categories: {
        "default": {appenders: ["dateLog"], level: "debug"},
        "con": {appenders: ["console"], level: "debug"},
        "cy": {appenders: ["dateLog","console"], level: "debug"},
    }
})
// module.exports=log4js.getLogger;
module.exports = (param) => {
    if (param === "startup") log4js.getLogger("cy").debug(`Program Starting...
  ______             __       __            _______              __     
 /      \\           |  \\  _  |  \\          |       \\            |  \\    
|  $$$$$$\\ __    __ | $$ / \\ | $$ __    __ | $$$$$$$\\  ______  _| $$_   
| $$   \\$$|  \\  |  \\| $$/  $\\| $$|  \\  /  \\| $$__/ $$ /      \\|   $$ \\  
| $$      | $$  | $$| $$  $$$\\ $$ \\$$\\/  $$| $$    $$|  $$$$$$\\\\$$$$$$  
| $$   __ | $$  | $$| $$ $$\\$$\\$$  >$$  $$ | $$$$$$$\\| $$  | $$ | $$ __ 
| $$__/  \\| $$__/ $$| $$$$  \\$$$$ /  $$$$\\ | $$__/ $$| $$__/ $$ | $$|  \\
 \\$$    $$ \\$$    $$| $$$    \\$$$|  $$ \\$$\\| $$    $$ \\$$    $$  \\$$  $$
  \\$$$$$$  _\\$$$$$$$ \\$$      \\$$ \\$$   \\$$ \\$$$$$$$   \\$$$$$$    \\$$$$ 
          |  \\__| $$                                                    
           \\$$    $$                                                    
            \\$$$$$$                                                     
`);
    // else return log4js.getLogger(param);
    else return {
        conLogger: log4js.getLogger("con"),
        cyLogger: log4js.getLogger("cy"),
    }
};