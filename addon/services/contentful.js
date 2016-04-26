import Ember from 'ember';
import config from 'ember-get-config';

const {
  computed
} = Ember;

export default Ember.Service.extend({
  usePreviewApi: computed(function() {
    return config.contentful.usePreviewApi;
  })
});
