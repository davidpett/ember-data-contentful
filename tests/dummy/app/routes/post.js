import Route from '@ember/routing/route';
import { get } from '@ember/object';

export default Route.extend({
  model(params) {
    return this.store.queryRecord('post', {
      'fields.slug': params.post_slug
    });
  },

  serialize(model) {
    return { post_slug: get(model, 'slug') };
  }
});
