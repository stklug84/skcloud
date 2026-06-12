source 'https://rubygems.org'

# Supported Ruby (matches .ruby-version and the CI runners).
ruby '4.0.5'

# Standalone Jekyll 4 (Ruby 4 compatible). We build with Bundler in CI and
# deploy the artifact, so we don't need the `github-pages` metagem (which is
# pinned to commonmarker 0.23.x and cannot run on Ruby 4).
gem 'jekyll', '~> 4.3'

# Site plugins (all whitelisted by GitHub Pages and Jekyll 4 compatible).
group :jekyll_plugins do
  gem 'jekyll-feed', '~> 0.17'
  gem 'jekyll-seo-tag', '~> 2.8'
  gem 'jekyll-sitemap', '~> 1.4'
end

# Webrick is no longer in the Ruby stdlib; needed for `jekyll serve`.
gem 'webrick'

# Ruby 3.4+ removed several stdlib libs from default gems; older Jekyll
# versions still require them. Required on Ruby 4.x.
gem 'csv'
gem 'bigdecimal'
gem 'logger'
gem 'base64'
