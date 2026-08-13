const fs = require('fs');
const MWBot = require('mwbot');
const Page = require('../page/page');

/**
 * Page Storage (local files)
 */
module.exports = class PageStorage {
  /**
   * Creates an instance of PageStorage.
   * @param {Object} params
   * @param {String} params.dataPath Pages location
   * @param {String} params.apiURL API URL
   * @param {Object} params.botData Bot credentials
   * @param {Object} params.botData.login
   * @param {Object} params.botData.password
   */
  constructor(params) {
    this.dataPath = params.dataPath;
    this.apiURL = params.apiURL;
    this.ignoredPaths = [];
    this.data = [];
    // bot
    this.botData = params.botData;
    this.bot = new MWBot({
      apiUrl: this.apiURL,
    });
  }

  /**
   * Initialize data
   */
  init() {
    const { dataPath } = this;
    this.getLocalPages(dataPath);
    console.log('PageStorage initialized');
  }

  /**
   * Get pages list
   * @returns {String[]}
   */
  getPageList() {
    return this.data.map(p => p.name);
  }

  /**
   * Download page or pages
   * @param {String[]} pagenames
   */
  download(pagenames) {
    this.bot.loginGetEditToken({
      apiUrl: this.apiURL,
      username: this.botData.user,
      password: this.botData.password,
    }).then(() => {
      return this.bot.read(pagenames.join('|'), false, { timeout: 8000 }).then((response) => {
        const ids = Object.keys(response.query.pages);
        ids.forEach((id) => {
          const pagename = response.query.pages[id]['title'];
          const revisions = response.query.pages[id]['revisions'];
          const content = revisions ? revisions[0].slots.main['*'] : '';
          if (content === undefined) {
            console.log(`There's no content for: ${pagename}`);
          }
          const path = this.getPathByName(pagename);
          this.savePageToStorage({ pagename, path, content });
        });
      }).catch((err) => {
        console.log(err);
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  /**
   * Write content to file
   * @param {Object} params
   * @param {Object} params.path Path to save
   * @param {Object} params.content Content
   */
  savePageToStorage(params) {
    const { path, content } = params;
    fs.writeFile(`${this.dataPath}/${path}`, content, { encoding: 'utf8', flag: 'w' }, (err) => {
      if (err) throw err;
      console.log(`${this.dataPath}/${path} -> saved!`);
    });
  }

  /**
   * Get path by page name
   * @param {String} pagename
   * @returns
   */
  getPathByName(pagename) {
    const page = this.data.find((p) => {
      return escape(p.name) === escape(pagename);
    });
    return page && page.path ? page.path : `${Page.getFilenameByPagename(pagename)}`;
  }

  /**
   * Get pages saved locally
   * @param {String} dir
   */
  getLocalPages(dir) {
    fs.readdirSync(dir).forEach((item) => {
      if (fs.lstatSync(`${dir}/${item}`, { encoding: 'utf8' }).isFile()) {
        this.data.push({
          name: Page.getPagenameByFilepath(`${dir}/${item}`),
          path: (`${dir}/${item}`).replace(`${this.dataPath}/`, ''),
        });
      } else if (this.ignoredPaths.indexOf(item) === -1) {
        this.getLocalPages(`${dir}/${item}`, this.data);
      }
    });
  }
};
