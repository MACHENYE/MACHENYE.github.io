#!/usr/bin/env node
/*
智能更新Hexo博客的updated时间
- 只有当文件内容被修改过（mtime > ctime）才更新updated字段
- 如果已有updated字段则更新它，否则在tags前添加
*/

const fs = require("fs");
const path = require("path");

console.log('脚本开始运行...');
const postsDir = "./_posts"; 

// 匹配updated字段的正则表达式
const updatedRegex = /^updated:\s*.+$/m;

fs.readdir(postsDir, (err, files) => {
    if (err) return console.error("读取目录错误：", err);
    
    files.forEach(file => {
        if (path.extname(file) === ".md") {
            processFile(path.join(postsDir, file));
        }
    });
});

function processFile(filePath) {
    fs.stat(filePath, (err, stats) => {
        if (err) return console.error(`读取文件信息错误 [${path.basename(filePath)}]:`, err);
        
        // 只有当文件被修改过（mtime > ctime）才处理
        if (stats.mtime > stats.ctime) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) return console.error(`读取文件内容错误 [${path.basename(filePath)}]:`, err);
                
                const updatedTime = formatDate(stats.mtime);
                let newContent;
                
                if (updatedRegex.test(data)) {
                    newContent = data.replace(updatedRegex, `updated: ${updatedTime}`);
                    console.log(`[更新] ${path.basename(filePath)} (已有updated字段)`);
                } else {
                    newContent = data.replace(/^tags:/m, `updated: ${updatedTime}\ntags:`);
                    console.log(`[添加] ${path.basename(filePath)} (新增updated字段)`);
                }
                
                fs.writeFile(filePath, newContent, 'utf8', err => {
                    if (err) console.error(`写入文件错误 [${path.basename(filePath)}]:`, err);
                });
            });
        } else {
            console.log(`[跳过] ${path.basename(filePath)} (文件未修改)`);
        }
    });
}

function formatDate(date, dateSeparator = "-", timeSeparator = ":") {
    const pad = num => num.toString().padStart(2, '0');
    const d = new Date(date);
    return [
        d.getFullYear(),
        pad(d.getMonth() + 1),
        pad(d.getDate())
    ].join(dateSeparator) + " " + [
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds())
    ].join(timeSeparator);
}