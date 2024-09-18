

def test_booting_test_server(client):
    ret = client.get('/api/health')

    assert True



