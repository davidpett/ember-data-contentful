import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('posts', { path: '/' });
  this.route('post', { path: 'posts/:post_slug'});
});

export default Router;
