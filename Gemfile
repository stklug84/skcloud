source 'https://rubygems.org'

# GitHub Pages metagem — pin to 232 which ships Jekyll 3.10.0 and liquid 4.0.4.
# v223 hard-pinned liquid 4.0.3, which calls String#tainted? — removed in
# Ruby 3.2+ — and breaks builds on Ruby 3.3.x runners.
# See https://pages.github.com/versions/ for the current GH Pages version.
gem 'github-pages', '~> 232', group: :jekyll_plugins

# Webrick is no longer in the Ruby stdlib; needed for `jekyll serve`.
gem 'webrick'

# Ruby 3.4+ removed several stdlib libs from default gems; older Jekyll
# versions still require them. Harmless on Ruby 3.3.
gem 'csv'
gem 'bigdecimal'
gem 'logger'
gem 'base64'
