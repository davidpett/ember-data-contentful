[![Build Status](https://travis-ci.org/davidpett/ember-data-contentful.svg?branch=master)](https://travis-ci.org/davidpett/ember-data-contentful)
[![npm version](https://badge.fury.io/js/ember-data-contentful.svg)](https://badge.fury.io/js/ember-data-contentful)
[![Ember Observer Score](http://emberobserver.com/badges/ember-data-contentful.svg)](http://emberobserver.com/addons/ember-data-contentful)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![FastBoot Ready](https://img.shields.io/badge/FastBoot-ready-brightgreen.svg)](http://ember-fastboot.com)
# ember-data-contentful

This is an Ember Data adapter/serializer that uses the **READ ONLY** Content Delivery API from [contentful](http://contentful.com)

## Setup in your app
```sh
ember install ember-data-contentful
```

After installing the addon, configure your Contentful Space ID and Access Token inside `ENV` in `config/environment.js`:
```js
contentful: {
  space: 'YOUR-CONTENTFUL-SPACE',
  accessToken: 'YOUR-CONTENTFUL-ACCESS-TOKEN',
  previewAccessToken: 'YOUR-CONTENTFUL-PREVIEW-ACCESS-TOKEN',
  usePreviewApi: false,
  environment: 'OPTIONAL CONTENTFUL ENVIRONMENT NAME'
}
```

You can enable the Preview API for use in development in `config/environment.js`:

```js
  if (environment === 'development') {
    // ...
    
    ENV.contentful.usePreviewApi = true;
  }
```

### Contentful models

Included are a few models to help with some of the default fields. Here is an example:

```js
// models/post.js
import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Contentful.extend({
  author: hasMany('author'),
  body: attr('string'),
  date: attr('date'),
  featuredImage: belongsTo('contentful-asset'),
  slug: attr('string'),
  title: attr('string')
});
```
will give you the default fields of `contentType`, `createdAt`, and `updatedAt`.

For multi-word model names, you can name your Contentful model IDs with dashes (ie. `timeline-post`) make sure the `contentType` field is inferred correctly.

For any relationship property that is a Contentful Asset (image or other media file), use the `contentful-asset` model. i.e. `image: belongsTo('contentful-asset')` in order to get the asset correctly.

### Adapters and serializers

You will also need to define an adapter and serializer for your model, so that Ember Data knows to fetch data from Contentful instead of your default backend.

```js
// app/adapters/post.js
import ContentfulAdapter from 'ember-data-contentful/adapters/contentful';

export default ContentfulAdapter.extend({});
```

```js
// app/serializers/post.js
import ContentfulSerializer from 'ember-data-contentful/serializers/contentful';

export default ContentfulSerializer.extend({});
```

If you are only using Contentful models, you can set these to `app/adapters/application.js` and `app/serializers/application.js` to apply for all models.

## Usage

Once you have configured your tokens and created your models, you can use the normal Ember Data requests of `findRecord`, `findAll`, `queryRecord`, and `query`. For example:
```js
model() {
  return this.store.findAll('project');
}
```
or
```js
model(params) {
  return this.store.findRecord('project', params.project_id);
}
```

If you want to use pretty urls and the `slug` field in contentful, you can make your query like so:
```js
model(params) {
  return this.store.queryRecord('page', {
    'fields.slug': params.page_slug
  });
},
serialize(model) {
  return { page_slug: get(model, 'slug') };
}
```
and ensure that you declare your route in `router.js` like this:
```js
this.route('page', { path: ':page_slug' });
```

## Previewing Content

Contentful provides a [Preview API](https://www.contentful.com/developers/docs/references/content-preview-api/) that allows you to preview unpublished content. In order to enable this, ensure you have your `previewAccessToken` configured in `config/environment.js` and enable the `usePreviewApi` property.

For more information on the contentful Content Delivery API and the available queries, look here: https://www.contentful.com/developers/docs/references/content-delivery-api/
