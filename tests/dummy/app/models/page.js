import Contentful from 'ember-data-contentful/models/contentful';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';

export default Contentful.extend({
  slug: attr('string'),
  title: attr('string'),

  modules: hasMany('module')
});
