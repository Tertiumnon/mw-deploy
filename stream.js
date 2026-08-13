const path = require('path');
const chokidar = require('chokidar');
const MWBot = require('mwbot');
const Page = require('./components/page/page');
const settings = require('./settings');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // Disable SSL alerts

// Получаем аргументы
const server = process.argv.length > 2 && process.argv[2] ? process.argv[2].slice(2) : 'default';
const summary = process.argv.length > 3 && process.argv[3] ? process.argv[3] : 'Page streaming';

const watchPath = settings[server].articles_path;

console.log('>>> Watching:', watchPath);

const watcher = chokidar.watch(watchPath, {
  ignored: /(^|[/\\])\.git([/\\]|$)/,
  ignoreInitial: true,
});

watcher.on('change', (filePath) => {
  const pageName = Page.getPagenameByFilepath(path.basename(filePath));
  console.log('>>> Open stream for page:', pageName);
  const text = Page.getFileContent(filePath);
  const p = new Page({ name: pageName, text });

  const bot = new MWBot({
    apiUrl: settings[server].server_api,
  });
  bot.login({
    username: settings[server].bot_user,
    password: settings[server].bot_password,
  }).then(() => bot.getEditToken())
    .then(() => bot.update(p.name, p.text, summary))
    .then((response) => {
      console.log(`>>> ${response.edit.title} | ${response.edit.result}`);
    })
    .catch((err) => {
      console.log(err);
    });
});
