import time

from qdata.generators.meta import create_timestamp
from qdata.components.comment import Comment, SupportedCommentType

user = 'test_user'
user2 = 'test_user2'


def test_adding_multiple_versions():

    # Creating correct lists. Not checking timestamps since those are harder to have control over.
    content_list = ["this is a comment", "this is a new comment"]
    author_list = [user, user2]
    type_list = [SupportedCommentType.string.value, SupportedCommentType.string.value]

    my_comment = Comment("this is a comment", user)

    assert len(my_comment.content) == 1
    assert len(my_comment.dates) == 1
    assert len(my_comment.authors) == 1
    assert len(my_comment.com_type) == 1

    my_comment.modify("this is a new comment", user2)

    assert my_comment.content == content_list
    assert my_comment.authors == author_list
    assert my_comment.com_type == type_list
    assert len(my_comment.dates) == 2


def test_last_comment_index():
    """
    This should not really be an issue since the last comment should always be the last item in the list,
    but to not depend on that, we will test it.
    """

    my_comment = Comment("this is a comment", user)
    new_comments = ["this is a new comment 2", "this is a new comment 3"]
    first = create_timestamp()
    time.sleep(0.1)
    second = create_timestamp()
    stamps = [first, second]

    for com, stamp in zip(new_comments, stamps):
        my_comment.content.append(com)
        my_comment.authors.append(user2)
        my_comment.com_type.append(SupportedCommentType.classify(com))
        my_comment.dates.append(stamp)

    assert my_comment.last_comment_index() == 2

    # re-arranging the items
    my_comment.content = [my_comment.content[1], my_comment.content[2], my_comment.content[0]]
    my_comment.authors = [my_comment.authors[1], my_comment.authors[2], my_comment.authors[0]]
    my_comment.com_type = [my_comment.com_type[1], my_comment.com_type[2], my_comment.com_type[0]]
    my_comment.dates = [my_comment.dates[1], my_comment.dates[2], my_comment.dates[0]]

    assert my_comment.last_comment_index() == 1


def test_multiple_revisions_with_same_timestamps():

    my_comment = Comment("this is a comment", user)

    my_comment.dates.append(my_comment.dates[0])
    my_comment.authors.append(user2)
    my_comment.content.append("this is another new comment")
    my_comment.com_type.append(SupportedCommentType.string.value)

    try:
        last_index = my_comment.last_comment_index()
    except ValueError as e:
        assert True
        return

    # when the exception gets caught, it ends the function, never reaching this point
    assert False


def test_classificator(tmp_path):

    # creating my path
    m_path = tmp_path.joinpath("my_path")
    m_path.mkdir()

    # testing a md file
    text = "my_path/somefilename.md"
    f_path = tmp_path.joinpath(text)
    f_path.touch()
    assert SupportedCommentType.classify(text) == SupportedCommentType.md.value

    # testing a string
    text = "this is a comment that we are doing"
    assert SupportedCommentType.classify(text) == SupportedCommentType.string.value

    # testing a directory
    text = "my_path/somedirname"
    d_path = tmp_path.joinpath(text)
    d_path.mkdir()
    # I check if the folder exists to classify it as a folder so I need to pass the absolute path of the folder.
    assert SupportedCommentType.classify(str(d_path)) == SupportedCommentType.dir.value

    # testing a jpg file
    text = "my_path/somefilename.jpg"
    f_path = tmp_path.joinpath(text)
    f_path.touch()
    assert SupportedCommentType.classify(text) == SupportedCommentType.jpg.value

    # testing a png file
    text = "my_path/somefilename.png"
    f_path = tmp_path.joinpath(text)
    f_path.touch()
    assert SupportedCommentType.classify(text) == SupportedCommentType.png.value

    # testing a long string
    text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    assert SupportedCommentType.classify(text) == SupportedCommentType.string.value













