import os
import re
from urllib.parse import urlparse
import xml.etree.ElementTree as etree

from markdownify import MarkdownConverter, chomp

from markdown.extensions import Extension
from markdown.inlinepatterns import LinkInlineProcessor, Pattern
from markdown.blockprocessors import BlockProcessor


API_URL_PREFIX = os.getenv('API_URL_PREFIX', '')
URL_HOST = os.getenv('URL_HOST', '')


# HTML to markdown
class MyMarkdownConverter(MarkdownConverter):

    def __init__(self, uuid_index, **kwargs):
        super().__init__(**kwargs)
        self.uuid_index = uuid_index

    #TODO: Check if it is ok for me to steal the code like this so I don't have to re parse it again.
    def convert_a(self, el, text, convert_as_inline):
        
        # Checks if the a has an image inside. this means that the imagesw points to an Instance and we should ignore it
        img_el = el.find('img')
        if img_el is not None:
            return self.convert_img(img_el, "", convert_as_inline)
        
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
        Handles the incoming html images and converts the link from html into the markdown pointing to the path of the image.
        """
        src = el.attrs['src']
        # Remove the 'http://localhost:8000/api/properties/image/' part from the src
        src = src.replace(f'{API_URL_PREFIX}/api/properties/image/', '')
        # Replace '%23' with '/'
        src = src.replace('%23', '/')
        el.attrs["src"] = src
        if 'alt' in el.attrs:
            del el.attrs['alt']

        img_md = f"![{text}]({el.attrs['src']})"
        return img_md
        # return super().convert_img(el, text, convert_as_inline)

    def convert_iframe(self, el, text, convert_as_inline):
        """
        Handles the incoming html iframes and converts the link from html into the markdown pointing to the path of the iframe.
        """
        return str(el)


class StrikethroughPattern(Pattern):
    """ InlinePattern for strikethrough text. """
    def handleMatch(self, m):
        # m.group(2) contains the text between the ~~ symbols
        el = etree.Element('del')
        el.text = m.group(2)
        return el


# Markdown to HTML
class CustomLinkExtension(Extension):

    def __init__(self, uuid_index, instance_index, *args, **kwargs):
        self.uuid_index = uuid_index
        self.instance_index = instance_index
        super().__init__(*args, **kwargs)

    def extendMarkdown(self, md):
        md.inlinePatterns.register(CustomLinkProcessor(self.uuid_index, self.instance_index, r'!?\[(.*?)\]\((.*?)\)', md), 'link', 160)
        
        # Register the new strikethrough pattern
        # The pattern ~~(.+?)~~ matches text between two ~~ symbols
        strikethrough_pattern = StrikethroughPattern(r'~~(.+?)~~', md)
        md.inlinePatterns.register(strikethrough_pattern, 'strikethrough', 175)


class CustomLinkProcessor(LinkInlineProcessor):

    def __init__(self, uuid_index, instance_index, *args, **kwargs):
        # Need the index to check if a link goes to an image or to an entity
        self.uuid_index = uuid_index
        self.instance_index = instance_index
        super().__init__(*args, **kwargs)

    def handleMatch(self, m, data):

        # group(2) is the text that it is linking too. If this is uuid and it is in the uuid index, it means it is
        # mention, if not assuming it is a link to an image
        if m.group(2) in self.uuid_index:
            text = m.group(1)
            url = f"/entities/{m.group(2)}"
            el = etree.Element('a')
            el.text = text
            el.set('href', url)
            el.set("class", "data-mention")
            return el, m.start(0), m.end(0)

        # Converts the markdown image into an html link pointing to the url of the image
        text = m.group(1)
        img_path = m.group(2).replace('/', '%23')
        url = f"{API_URL_PREFIX}/api/properties/image/{img_path}"

        # Checks if the image is in the instance index, if it is, it means it is an image that is in the instance and
        # should have a link to it.
        if m.group(2) in self.instance_index:
            a_el = etree.Element('a')
            href = f"{URL_HOST}/entities/{self.instance_index[m.group(2)]}"
            a_el.set('href', href)
            a_el.set("class", "image-link")
            img_el = etree.SubElement(a_el, 'img')
            img_el.text = text
            img_el.set('src', url)
            img_el.set('alt', 'Image is loading or not available')
            return a_el, m.start(0), m.end(0)

        el = etree.Element('img')
        el.text = text
        el.set('src', url)
        el.set('alt', 'Image is loading or not available')
        return el, m.start(0), m.end(0)
    

class CustomHeadlessTableExtension(Extension):
    """
    Custom extension to be able to accept tables without headers
    """
    def extendMarkdown(self, md):
        md.parser.blockprocessors.register(CustomHeadlessTablesProcessor(md.parser), 'custom_table', 75)

class CustomHeadlessTablesProcessor(BlockProcessor):
    
    RE_TABLE = re.compile(r'''
        ^[ ]{0,3}(\|.*\|)[ ]*(\n|$)   # First line must start with '|' (after optional whitespace)
        ''', re.MULTILINE | re.VERBOSE)

    def test(self, parent, block):
        return bool(self.RE_TABLE.search(block))

    def run(self, parent, blocks):
        block = blocks.pop(0)
        table = etree.SubElement(parent, 'table')
        tbody = etree.SubElement(table, 'tbody')

        rows = block.strip().split('\n')
        for row in rows:
            tr = etree.SubElement(tbody, 'tr')
            for cell in row.strip('|').split('|'):
                td = etree.SubElement(tr, 'td')
                td.text = cell.strip()
    
    