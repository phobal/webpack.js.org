const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const request = require('request-promise');
const writeFileSync = promisify(fs.writeFileSync);
const cwd = process.cwd();

// 获取 webpack.js.org 官网 、src/content 下的所有文档
async function getWebpackOrgContentFiles() {
  const webpackGithubDicTreeUrl = 'https://api.github.com/repos/webpack/webpack.js.org/git/trees/master?recursive=1';
  const options = {
    uri: webpackGithubDicTreeUrl,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:78.0) Gecko/20100101 Firefox/78.0'
    },
    json: true
  };
  const { tree } = await request(options);
  const regex = /^src\/content.*\.(md|mdx)$/;
  const contentArray = tree.filter(t => regex.test(t.path)).map(t => t.path);
  return new Promise((resolve) => {
    resolve(contentArray);
  });
}

async function writeWebpackOrgContentFiles(files) {
  files.forEach(async (file, index) => {
    const fileSplit = file.split('/');
    const fileSplitLength = fileSplit.length;
    const fileName = fileSplit[fileSplitLength - 1];
    const filePath = fileSplit.filter(f => f !== fileName && f !== fileSplit[0]).join('/');
    const outputDir = path.resolve(__dirname, `../../temp/${filePath}`);
    await mkdirp(outputDir);
    const url = `https://raw.githubusercontent.com/webpack/webpack.js.org/master/${file}`;
    request(url).then(async (content) => {
      await writeFileSync(path.resolve(outputDir, `${fileName}`), content);
      console.log(`写入: 第 ${index + 1} / ${files.length} 文件 {path.relative(cwd, fileName)}, 成功！`);
      await sleep(1);
    });
  });
}

async function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time * 1000);
  });
}

async function main() {
  const contentArray = await getWebpackOrgContentFiles();
  await writeWebpackOrgContentFiles(contentArray);
}

main();
// writeWebpackOrgContentFiles(['src/content/index.md']);
