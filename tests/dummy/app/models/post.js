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
