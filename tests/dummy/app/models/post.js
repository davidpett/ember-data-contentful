import DS from 'ember-data';

const {
  attr,
  belongsTo,
  hasMany
} = DS;

export default DS.Model.extend({
  author: hasMany('author'),
  body: attr('string'),
  date: attr('date'),
  featuredImage: belongsTo('asset'),
  slug: attr('string'),
  title: attr('string')
});
