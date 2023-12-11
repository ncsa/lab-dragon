
from urllib.parse import urlparse

from markdownify import MarkdownConverter, chomp

from markdown.extensions import Extension
from markdown.inlinepatterns import LinkInlineProcessor
import xml.etree.ElementTree as etree

from qdata import HOSTADDRESS, WEBSERVERADDRESS


# HTML to markdown
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
        # This just makes debugging easier
        ret_text = '%s[%s](%s%s)%s' % (prefix, text, href, title_part, suffix) if href else text
        return ret_text

    def convert_img(self, el, text, convert_as_inline):
        """
        Removes the extra localhost part of the url and replaces the %23 with a /
        """
        el.attrs["src"] = el.attrs['src'][43:].replace("%23", "/")
        del el.attrs['alt']
        return super().convert_img(el, text, convert_as_inline)


# Markdown to HTML
class CustomLinkExtension(Extension):

    def __init__(self, uuid_index, *args, **kwargs):
        self.uuid_index = uuid_index
        super().__init__(*args, **kwargs)

    def extendMarkdown(self, md):
        md.inlinePatterns.register(CustomLinkProcessor(self.uuid_index, r'!?\[(.*?)\]\((.*?)\)', md), 'link', 160)


class CustomLinkProcessor(LinkInlineProcessor):

    def __init__(self, uuid_index, *args, **kwargs):
        # Need the index to check if a link goes to an image or to an entity
        self.uuid_index = uuid_index
        super().__init__(*args, **kwargs)

    def handleMatch(self, m, data):

        # group(2) is the text that it is linking too. If this is uuid and it is in the uuid index, it means it is
        # mention, if not assuming it is a link to an image
        if m.group(2) in self.uuid_index:
            text = m.group(1)
            url = f"{WEBSERVERADDRESS}entities/{m.group(2)}"
            el = etree.Element('a')
            el.text = text
            el.set('href', url)
            return el, m.start(0), m.end(0)

        text = m.group(1)
        url = m.group(2).replace('/', '%23')
        url = f"{HOSTADDRESS}properties/image/{url}"
        el = etree.Element('img')
        el.text = text
        el.set('src', url)
        el.set('alt', 'Image is loading or not available')
        return el, m.start(0), m.end(0)