import generateRobotstxt from '../index';
import path from 'path';
import test from 'ava';

const fixturesPath = path.join(__dirname, 'fixtures');

test('should generated default content without options',
    (t) => generateRobotstxt()
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\n');
        })
);

test('should contain two policy item with "Allow"',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            userAgent: 'Google'
        }, {
            allow: '/',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nAllow: /\n\n'
                    + 'User-agent: Yandex\nAllow: /\n'
            );
        })
);

test('should contain two policy item with "Allow" and "Disallow"',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            disallow: '/search-foo',
            userAgent: 'Google'
        }, {
            allow: '/',
            disallow: '/search-bar',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nAllow: /\nDisallow: /search-foo\n\n'
                    + 'User-agent: Yandex\nAllow: /\nDisallow: /search-bar\n'
            );
        })
);

test('should contain two policy item, first have multiple "User-agent"',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            disallow: '/search-foo',
            userAgent: ['Google', 'AnotherBot']
        }, {
            allow: '/',
            disallow: '/search-bar',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nUser-agent: AnotherBot\nAllow: /\nDisallow: /search-foo\n\n'
                + 'User-agent: Yandex\nAllow: /\nDisallow: /search-bar\n'
            );
        })
);

test('should throw error if "policy" option is not array', (t) => {
    t.throws(generateRobotstxt({
        policy: 'string'
    }), 'Options "policy" must be array');
});

test('should throw error if "policy" option not have "userAgent"', (t) => {
    t.throws(generateRobotstxt({
        policy: [{}]
    }), 'Each "police" should have "User-agent"');
});

test('should throw error if "policy" option have empty "userAgent"', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            userAgent: []
        }]
    }), 'Each "police" should have "User-agent"');
});

test('should contain "Sitemap"',
    (t) => generateRobotstxt({
        sitemap: 'sitemap.xml'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nSitemap: sitemap.xml\n');
        })
);

test('should contain two "Sitemap"',
    (t) => generateRobotstxt({
        sitemap: [
            'sitemap.xml',
            'sitemap1.xml'
        ]
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nSitemap: sitemap.xml\nSitemap: sitemap1.xml\n');
        })
);

test('should contain "Host"',
    (t) => generateRobotstxt({
        host: 'http://domain.com'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: http://domain.com\n');
        })
);

test('should throw error if "Host" option is array', (t) => {
    t.throws(generateRobotstxt({
        host: [
            'http://domain.com',
            'http://domain1.com'
        ]
    }), 'Options "host" must be one');
});

test('should contain multiple "User-agent" and "Crawl-delay"',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            crawlDelay: 10,
            userAgent: 'Google'
        }, {
            allow: '/',
            crawlDelay: 0.5,
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nAllow: /\nCrawl-delay: 10\n\nUser-agent: Yandex\nAllow: /\nCrawl-delay: 0.5\n'
            );
        })
);

test('should throw error on invalid "crawlDelay" option', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            allow: '/',
            crawlDelay: 'foo',
            userAgent: 'Google'
        }]
    }), 'Options "crawlDelay" must be integer or float');
});

test('should contain one policy item with one "Clean-param"',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: 's /forum/showthread.php',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(content, 'User-agent: Yandex\nAllow: /\nClean-param: s /forum/showthread.php\n');
        })
);

test('should contain one policy item with two "Clean-params"',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: [
                's /forum/showthread.php',
                'ref /forum/showthread.php'
            ],
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Yandex\nAllow: /\n'
                    + 'Clean-param: s /forum/showthread.php\n'
                    + 'Clean-param: ref /forum/showthread.php\n'
            );
        })
);

test('should load config file',
    (t) => generateRobotstxt({
        configFile: `${fixturesPath}/config.js`
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: *\nAllow: /\nHost: http://some-domain.com\n'
            );
        })
);

test('should load commonjs config file',
    (t) => generateRobotstxt({
        configFile: `${fixturesPath}/config-commonjs.js`
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: *\nAllow: /\nHost: http://some-some-domain.com\n'
            );

            return content;
        })
);
