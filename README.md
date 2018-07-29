# Medium-Markdown
--------------------------------
### Purpose
The purpose of this project is two-fold for me:
* Learn more about writiing JavaScript in a NodeJS style, learning more about promises, async/await and how to create a node module.
* Scratch an itch - there already exist node packages for exporting Medium articles to markdown files but I found that they didn't cope well with Github Gists or Codepen iFrames, two key components to most of my articles.

This project is far from bug-free, but I think the main objectives are currently working i.e. links, gists and Codepen iframes are all being exported so they work for my GatsbyJS blog. Feel free to leave issues, fork it or suggest improvements.

---------------------------------
### Usage
As of the moment this is only a command line tool for personal use. If you download it and run the following command you should get your medium article in your command line which you can copy and paste into a file.

```
node index.js medium-url
```
---------------------------------
### Plans for the Future
The future plans are to add more features of converting to markdown including working with images, links to other authors etc. 
