import Ember from 'ember';

const {
  get,
  set
} = Ember;

export default Ember.Route.extend({
  model(params) {
    return this.store.queryRecord('post', {
      'fields.slug': params.post_slug
    });
  },
  serialize(model) {
    return { post_slug: get(model, 'slug') };
  },

  actions: {
    changeContent(mod) {
      set(mod, 'body', 'fooooooooooo');
      mod.save();
    }
  }
});
