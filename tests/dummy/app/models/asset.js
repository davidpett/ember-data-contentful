import DS from 'ember-data';

const {
  attr
} = DS;

export default DS.Model.extend({
  file: attr(),
  title: attr('string')
});
