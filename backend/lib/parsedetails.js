const _ = require('lodash');
const debug = require('debug')('lib:parsedetails');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

function attributeURL(href) {

    if(href.match(/viewkey=/)) {
        debug("url %s match video", href);
        return {
            href: href,
            type: 'video',
            videoId: href.replace(/.*viewkey=/, '')
        };
    }

    debug("broken!");
    return { href: href, type: null };
};

function getMetadata(html) {
  const dom = new JSDOM(html);
  const D = dom.window.document;
  
  const vTitle = D.querySelectorAll("h1")[0].querySelector("span").textContent;
  const views = D.querySelector('div.views');

  let counting = -1;
  try {
    counting = _.parseInt(views
        .querySelector(".count").textContent.replace(/,/, ''));
  } catch(err) {
    debug("Views extractor failure (%s): %s",
        viewx.textContent, err);
  }

  const starname = D.querySelector('[data-mxptext]').getAttribute('data-mxptext')
  const starurl = D.querySelector('[data-mxptext]').getAttribute('href')

  return {
    title: vTitle,
    views: counting,
    actor: starname,
    actorPagE: starurl
  };
};

function getRelated(html) {
  const dom = new JSDOM(html);
  const D = dom.window.document;
  const relatedUrls = D.querySelectorAll('[data-related-url]');
  let related = [];

  _.each(relatedUrls, function(e) {
    let t = e.getAttribute('title');
    let h = e.getAttribute('href');
    let k = h ? h.match(/viewkey=/) : null;

    if(!t || !h || !k) return;

    related.push({ 
        title: t,
        href: h,
        videoId: h.replace(/.*viewkey=/, '')
    });
  });

  debug("From %d data-related-url found %d related", _.size(relatedUrls), _.size(related));
  return related; 
};

function getCategories(html) {
  const dom = new JSDOM(html);
  const D = dom.window.document;
  const cats = D.querySelectorAll('.categoriesWrapper');

  if(_.size(cats) !== 1)
    debug("Odd? the categories are not 1? %d", _.size(cats));

  let categories = [];
  _.each(cats[0].querySelectorAll('a'), function(e) {
    if(!_.startsWith(e.textContent, '+'))
        categories.push(e.textContent);
  });
  return categories;
};


module.exports = {
    attributeURL:attributeURL,
    getMetadata: getMetadata,
    getRelated: getRelated,
    getCategories: getCategories
};
