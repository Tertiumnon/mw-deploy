# MediaWiki Template Deploy

MediaWiki Template Deploy is a tool for deploying MediaWiki-pages to remote server with MediaWiki.

You can:

* Stream articles
* Update articles
* Delete articles

## Types of servers

Your main server is "default" server. You can run:

```Bash
npm run stream
```

And stream-script will connect to default-server. But in settings.js you can add other types of servers like:

* dev
* prod

So then you can use this types like arguments when you run your npm-commands, for example:

```Bash
npm run stream -- --dev
npm run stream -- --prod
```

## Stream pages

Stream-process watches files in articles directory. If a page has been changed, stream-process will update this wiki-page on target-server.

```Bash
npm run stream -- --dev {{Summary}}
```

## Update (create) pages

Update-process updates wiki-pages on target-server.

```Bash
npm run update -- --dev {{Summary}}
```

## Delete pages

Delete-process removes wiki-pages on target-server.

```Bash
npm run delete -- --dev {{Summary}}
```

## Documentation

- [Install](docs/INSTALL.md)

## Support

If this project is useful to you, you can support its development on [Ko-fi](https://ko-fi.com/tertiumnon).
