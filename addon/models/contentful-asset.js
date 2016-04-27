import Contentful from './contentful';
import attr from 'ember-data/attr';

export default Contentful.extend({
  file: attr(),
  title: attr('string')
});
