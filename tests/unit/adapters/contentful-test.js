import { test, moduleForModel } from 'ember-qunit';
import ContentfulModel from 'ember-data-contentful/models/contentful';
import ContentfulAdapter from 'ember-data-contentful/adapters/contentful';

import attr from 'ember-data/attr';

let Post;

moduleForModel('contentful', 'Unit | Adapter | contentful', {
  beforeEach() {

    Post = ContentfulModel.extend({
      title: attr('string'),
    });

    this.registry.register('model:post', Post);
  }
});

test('queryRecord calls _getContent with correct parameters when query is empty', function(assert) {

  let actualParams = null;

  const ApplicationAdapter = ContentfulAdapter.extend({
    _getContent(type, params) {
      actualParams = params;
      this._super(...arguments);
    }
  });
  this.registry.register('adapter:application', ApplicationAdapter);

  this.store().queryRecord('post', { });

  assert.deepEqual(actualParams, {
    content_type: 'post',
    skip: 0,
    limit: 1
  });

});

test('queryRecord calls _getContent with correct parameters', function(assert) {

  let actualParams = null;

  const ApplicationAdapter = ContentfulAdapter.extend({
    _getContent(type, params) {
      actualParams = params;
      this._super(...arguments);
    }
  });
  this.registry.register('adapter:application', ApplicationAdapter);

  this.store().queryRecord('post', { order: 'fields.title' });

  assert.deepEqual(actualParams, {
    content_type: 'post',
    order: 'fields.title',
    skip: 0,
    limit: 1
  });

});
