
from urllib.parse import urlparse

from markdownify import MarkdownConverter, chomp


class MyMarkdownConverter(MarkdownConverter):

    def __init__(self, uuid_index, **kwargs):
        super().__init__(**kwargs)
        self.uuid_index = uuid_index

    #TODO: Check if it is ok for me to steal the code like this so I don't have to re parse it again.
    def convert_a(self, el, text, convert_as_inline):
        prefix, suffix, text = chomp(text)
        if not text:
            return ''
        href = el.get('href')
        parsed_ref = urlparse(href)
        path_parts = parsed_ref.path.split('/')
        uuid = path_parts[-1]
        href = self.uuid_index[uuid]
        title = el.get('title')

        # For the replacement see #29: text nodes underscores are escaped
        if (self.options['autolinks']
                and text.replace(r'\_', '_') == href
                and not title
                and not self.options['default_title']):
            # Shortcut syntax
            return '<%s>' % href
        if self.options['default_title'] and not title:
            title = href
        title_part = ' "%s"' % title.replace('"', r'\"') if title else ''
        return '%s[%s](%s%s)%s' % (prefix, text, href, title_part, suffix) if href else text




