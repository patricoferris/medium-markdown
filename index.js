/*
* Author: Patrick Ferris
* Description: This node module takes a medium article url and converts it to markdown specifically
* for working with GatsbyJS (and the gatsby-remark-prismjs plugin for code).
*/
const axios = require('axios');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const mediumUrl = process.argv[2];

//Medium Type Dictionary
const para = 1;
const emphasis = 2;
const url = 3;
const iframe = 11;
const subtitle = 13;
const githubEmbed = 14;

//Some global parameters
let postId;
let markdown = '';

const markify = async url => {
  try {
    const response = await axios.get(url);
    let data = response.data;
    json = JSON.parse(data.slice(16, data.length));

    json = json.payload.value;
    postId = json.id;

    markdown += `#${json.title}\n\n`;
    markdown += `##${json.content.subtitle}\n\n`;

    //Create a list of promises of converting the text to markdown
    const markdownPromises = json.content.bodyModel.paragraphs.slice(2).map(async (obj) => {
        return await convertToMarkdown(obj);
    });

    //Wait for each of these to successfully complete
    const markdownObjects = await Promise.all(markdownPromises);

    // Add them to the global markdown variable
    markdownObjects.forEach((obj) => {
      markdown += (obj + '\n\n');
    });

    return markdown;
  } catch(error) {
    console.log(error);
  }
}

//Converting each Medium type to a Markdown string
function convertToMarkdown(obj) {
  return new Promise((resolve, reject) => {
    let {type, text, url, markups} = obj;
    // Markdown Paragraph
    let offset = 0;
    if(type == para) {
      if(markups.length == 0) {
        resolve(text);
      } else {
        resolve(markup(text, markups));
      }
    } else if (type == iframe) {
      iFrame(obj).then((text) => {
        resolve(text);
      });
    } else if (type == url) {
      // A link to another resource
      resolve(link(text, url));
    } else if (type == subtitle) {
      resolve(`###${text}`);
    } else {
      resolve(text);
    }
  });
}

//Creating markdown link
function link(text, url) {
  return `[${text}](${url})`;
}

//Emphasising the text using italics
function em(text) {
  return `*${text}*`;
}

//Adding markups to the text
function markup(text, markups) {
  let newText = text;
  let offset = 0;
  markups.forEach(obj => {
    let {type, start, end, href} = obj;
    if(type == url) {
      insert = link(newText.slice(start + offset, end + offset), href);
      newText = replaceAt(newText, start + offset, end + offset, insert);
      offset += (insert.length - (end - start));
    }
  });
  return newText;
}

//Handling iFrames (supporting Gists and Codepens)
function iFrame(obj){
  return new Promise((resolve) => {
    const { iframe } = obj;
    const { mediaResourceId } = iframe;
    let url = `https://medium.com/media/${mediaResourceId}?postId=${postId}`;
    let domain = '';
    let data = getHtml(url)
      .then((data) => {
        json = JSON.parse(data.slice(16, data.length));
        json = json.payload.value;
        domain = json.domain;
        let iframe = getHtml(json.href)
          .then((html) => {
            //Code for extracting the code for a Github Gist
            if(domain != 'codepen.io') {
              const dom = new JSDOM(html);
              let fileType = dom.window.document.querySelector('Strong').textContent.split('.')[1];
              let codeType = 'javascript';
              let code = 'function(){hello;}';
              if(fileType == 'js') {
                codeType = 'javascript';
              } else if(fileType == 'html') {
                codeType = 'html';
              } else if(fileType == 'css') {
                codeType = 'css';
              }
              code = dom.window.document.querySelector('tbody').textContent;
              let codeString = ` \`\`\`${codeType} \n ${code} \`\`\` `;
              resolve(codeString);
            } else {
              //Code for Codepen iFrame
              const dom = new JSDOM(html);
              let iframe = dom.window.document.querySelector('iframe').outerHTML;
              let codeString = iframe;
              resolve(codeString);
            }
        }).catch((error) => {
            console.log(error);
        });
    }).catch((error) => {
        console.log(error);
    });
  });
}

//Handling Github Embeds
function GithubEmbed(text, url) {
		return input.slice(0, start)
    	+ input.slice(start, end).replace(search, replace)
      + input.slice(end);
}

async function getHtml(url) {
  try {
    const response = await axios.get(url);
    let data = response.data;
    return data;
  } catch(error) {
    console.log(error);
  }
}

function replaceAt(text, start, end, replacement) {
  return (text.slice(0, start) + replacement + text.slice(end));
}

markify(mediumUrl).then((markdown) => {
  console.log(markdown);
});
