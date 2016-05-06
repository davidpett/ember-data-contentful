import Oauth2Bearer from 'torii/providers/oauth2-bearer';
import config from 'ember-get-config';

let {
  clientId,
  redirectUri,
  scope
} = config.contentful;
scope = scope || 'content_management_manage';

var ContentfulOauth2 = Oauth2Bearer.extend({
  name: 'contentful-oauth2',
  baseUrl: 'https://be.contentful.com/oauth/authorize',
  clientId,
  redirectUri,
  scope,
  optionalUrlParams: ['client_id', 'scope']
});

export default ContentfulOauth2;
