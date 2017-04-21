import Ember from 'ember';

const {
  get
} = Ember;

export default Ember.Route.extend({
  model(params) {
    return this.store.queryRecord('page', {
      'fields.slug': params.path
    });
  }
});
