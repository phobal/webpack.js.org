const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const mkdirp = promisify(require('mkdirp'));
const writeFileSync = promisify(fs.writeFileSync);

const enContent = require('../en-content.json');
const zhContent = require('.././zh-content.json');


const flattenContentTree = (content) => {
  let result = []
  ;(function flatten(data) {
    data.forEach(m => {
      const { children, ...res } = m;
      const path = res.path.replace('temp', 'src');
      result.push({ ...res, path });
      if (children && children.length) {
        flatten(children);
      }
    });
  })(content);
  return result;
};

function mergeContent() {
  const { children, ...res } = zhContent;
  const cnFlattenContent = flattenContentTree(enContent.children);
  // console.log(cnFlattenContent);
  function flatten(children) {
    return children.map(content => {
      if (content.anchors && content.anchors.length) {
        const enContent = cnFlattenContent.find(c => c.path === content.path);
        const enAnchors = enContent && enContent.anchors;
        if (enAnchors) {
          content.anchors = content.anchors.map((anchor, index) => {
            return {
              ...anchor,
              id: enAnchors[index].id
            };
          });
        }
      } else {
        console.log(`${content.path}文档缺失，请下载！`);
      }
      if (content.children && content.children.length) {
        flatten(content.children);
      }
      return content;
    });
  }
  const mergedContent = flatten(children);
  writeContent({
    ...res,
    children: mergedContent
  });
}

async function writeContent(content) {
  const outputPath = path.resolve(__dirname, '../');
  await writeFileSync(path.resolve(outputPath, '_content.json'), JSON.stringify(content));
}

mergeContent();