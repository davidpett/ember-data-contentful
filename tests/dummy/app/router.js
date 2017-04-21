/* global FastBoot */
import Ember from 'ember';
import config from './config/environment';

const {
  get,
  inject: { service },
  run: { scheduleOnce }
} = Ember;

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL,
  metrics: service(),

  didTransition() {
    this._super(...arguments);
    if (typeof FastBoot === 'undefined') {
      this._trackPage();
    }
  },

  _trackPage() {
    scheduleOnce('afterRender', this, () => {
      const page = document.location.pathname;
      const title = this.getWithDefault('currentRouteName', 'unknown');

      get(this, 'metrics').trackPage({ page, title });
    });
  }
});

Router.map(function() {
  this.route('posts', { path: '/' });
  this.route('post', { path: 'posts/:post_slug'});
  this.route('page', { path: '*path' });
});

export default Router;
